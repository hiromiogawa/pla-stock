import { sql } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { KitEvent, KitEventReason } from '~/entities/kit'
import { kitEvents, kitStocks } from '~/entities/kit/schema'

type AddKitEventData = {
  kitId: string
  delta: number
  reason: KitEventReason
  projectId?: string | null
  purchasedAt?: string | null
  priceYen?: number | null
  purchaseLocation?: string | null
  note?: string | null
}

/**
 * production (D1) と test (better-sqlite3 :memory:) の両方を受け取れる
 * Drizzle DB 型の union。SQL は同一、atomic 実行 API のみ分岐する。
 */
type CompatibleDb = BetterSQLite3Database | DrizzleD1Database

/**
 * D1 (DrizzleD1Database) は db.batch を持つが、better-sqlite3 は持たない。
 * この差分で type guard し、両者で同じ SQL を atomic に実行する。
 */
function isD1Db(db: CompatibleDb): db is DrizzleD1Database {
  return 'batch' in db && typeof db.batch === 'function'
}

/**
 * D1/SQLite の在庫 CHECK(count>=0) 制約違反を判定する。
 *
 * `CHECK constraint failed` かつ stock count 非負制約名を含むときのみ true。
 */
function isStockCheckViolation(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return (
    message.includes('CHECK constraint failed') &&
    (message.includes('kit_stocks_count_non_negative') ||
      message.includes('paint_stocks_count_non_negative'))
  )
}

/**
 * kit の入出庫 mutation の DB ロジック本体。auth / env から分離した純粋関数で、
 * production の D1 でも test の in-memory better-sqlite3 でも動く。
 *
 * 実装メモ:
 * - D1: `db.batch([...])` で単一往復 atomic。interactive tx 非対応のため
 * - better-sqlite3: `db.transaction(() => {...})()` で sync transaction
 * - 両方で SQL は完全に同一 (CHECK / UNIQUE / FK の評価順も同じ)
 *
 * SQLite UPSERT の CHECK 評価順の罠 (ADR-0007 FAIL-003) を回避するため、INSERT
 * 候補 count を生 delta ではなく **最終結果値** ((既存 count or 0) + delta) で
 * 計算する。両分岐 (INSERT / DO UPDATE) が同じ値を CHECK にかける。
 */
export async function addKitEventToDb(
  db: CompatibleDb,
  userId: string,
  data: AddKitEventData,
): Promise<KitEvent> {
  const event: KitEvent = {
    id: crypto.randomUUID(),
    userId,
    kitId: data.kitId,
    delta: data.delta,
    reason: data.reason,
    projectId: data.projectId ?? null,
    purchasedAt: data.purchasedAt ?? null,
    priceYen: data.priceYen ?? null,
    purchaseLocation: data.purchaseLocation ?? null,
    note: data.note ?? null,
    createdAt: new Date(),
  }

  const nextCount = sql<number>`(select coalesce((select ${kitStocks.count} from ${kitStocks} where ${kitStocks.userId} = ${userId} and ${kitStocks.kitId} = ${data.kitId}), 0) + ${data.delta})`

  const buildInsertStock = (target: CompatibleDb) =>
    target
      .insert(kitStocks)
      .values({ userId, kitId: data.kitId, count: nextCount })
      .onConflictDoUpdate({
        target: [kitStocks.userId, kitStocks.kitId],
        set: { count: sql`${kitStocks.count} + ${data.delta}` },
      })
  const buildInsertEvent = (target: CompatibleDb) => target.insert(kitEvents).values(event)

  try {
    if (isD1Db(db)) {
      await db.batch([buildInsertStock(db), buildInsertEvent(db)])
    } else {
      db.transaction((tx) => {
        buildInsertStock(tx).run()
        buildInsertEvent(tx).run()
      })
    }
  } catch (err) {
    if (isStockCheckViolation(err)) {
      throw new Error('在庫が不足しています（在庫を負の数にはできません）', { cause: err })
    }
    throw err
  }

  return event
}
