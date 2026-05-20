import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { sql } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { kitStocks, kitEvents } from '~/entities/kit/schema'
import type { KitEvent } from '~/entities/kit'
import { addKitEventInput } from './schemas'

/**
 * D1/SQLite の在庫 CHECK(count>=0) 制約違反を判定する。
 *
 * `CHECK constraint failed` かつ stock count 非負制約名を含むときのみ true。
 * 無関係な CHECK 違反 / その他 error は false → 呼び出し側で元 error を
 * re-throw するため integrity は不変 (保証は DB の CHECK が持つ)。
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
 * kit の入出庫記録 (mutation)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - kit_stocks の find-or-create + count 増減 と kit_events insert を
 *   db.batch([...]) で atomic 実行 (D1 は interactive tx 非対応)
 * - count < 0 は DB の CHECK(count>=0) で拒否 → batch 全体 rollback。
 *   コードは事前チェックを持たず CHECK エラーを user-facing に翻訳するのみ
 */
export const addKitEvent = createServerFn({ method: 'POST' })
  .inputValidator(addKitEventInput)
  .handler(async ({ data }): Promise<KitEvent> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

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

    // SQLite evaluates CHECK(count >= 0) on the INSERT-candidate row *before*
    // resolving the unique conflict into DO UPDATE. If we use raw delta (negative
    // for a release) as the candidate count, even a valid release on an existing
    // row (e.g. count=1, delta=-1 → result 0) fails the CHECK because the
    // phantom candidate count=-1 is evaluated first.
    //
    // Fix: make the candidate count the TRUE resulting value:
    //   (existing count, or 0 if no row) + delta
    // Both conflict paths then see the same value as the post-update result,
    // so CHECK fires correctly in all cases. See ADR-0007 FAIL-003.
    const nextCount = sql<number>`(select coalesce((select ${kitStocks.count} from ${kitStocks} where ${kitStocks.userId} = ${userId} and ${kitStocks.kitId} = ${data.kitId}), 0) + ${data.delta})`

    try {
      await db.batch([
        db
          .insert(kitStocks)
          .values({ userId, kitId: data.kitId, count: nextCount })
          .onConflictDoUpdate({
            target: [kitStocks.userId, kitStocks.kitId],
            set: { count: sql`${kitStocks.count} + ${data.delta}` },
          }),
        db.insert(kitEvents).values(event),
      ])
    } catch (err) {
      if (isStockCheckViolation(err)) {
        throw new Error('在庫が不足しています（在庫を負の数にはできません）', { cause: err })
      }
      throw err
    }

    return event
  })
