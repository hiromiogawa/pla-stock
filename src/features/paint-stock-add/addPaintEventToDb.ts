import { sql } from 'drizzle-orm'
import type { PaintEvent, PaintEventReason } from '~/entities/paint'
import { paintEvents, paintStocks } from '~/entities/paint/schema'
import { type CompatibleDb, isD1Db, isStockCheckViolation } from '~/shared/lib/db/compat'

type AddPaintEventData = {
  paintId: string
  delta: number
  reason: PaintEventReason
  purchasedAt?: string | null
  priceYen?: number | null
  purchaseLocation?: string | null
  note?: string | null
}

/**
 * paint の入出庫 mutation の DB ロジック本体。auth / env から分離した純粋関数で、
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
export async function addPaintEventToDb(
  db: CompatibleDb,
  userId: string,
  data: AddPaintEventData,
): Promise<PaintEvent> {
  const event: PaintEvent = {
    id: crypto.randomUUID(),
    userId,
    paintId: data.paintId,
    delta: data.delta,
    reason: data.reason,
    purchasedAt: data.purchasedAt ?? null,
    priceYen: data.priceYen ?? null,
    purchaseLocation: data.purchaseLocation ?? null,
    note: data.note ?? null,
    createdAt: new Date(),
  }

  const nextCount = sql<number>`(select coalesce((select ${paintStocks.count} from ${paintStocks} where ${paintStocks.userId} = ${userId} and ${paintStocks.paintId} = ${data.paintId}), 0) + ${data.delta})`

  const buildInsertStock = (target: CompatibleDb) =>
    target
      .insert(paintStocks)
      .values({ userId, paintId: data.paintId, count: nextCount })
      .onConflictDoUpdate({
        target: [paintStocks.userId, paintStocks.paintId],
        set: { count: sql`${paintStocks.count} + ${data.delta}` },
      })
  const buildInsertEvent = (target: CompatibleDb) => target.insert(paintEvents).values(event)

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
