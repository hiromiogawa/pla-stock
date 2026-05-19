import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { sql } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { paintStocks, paintEvents } from '~/entities/paint/schema'
import type { PaintEvent } from '~/entities/paint'
import { addPaintEventInput } from './schemas'

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
    (message.includes('paint_stocks_count_non_negative') ||
      message.includes('kit_stocks_count_non_negative'))
  )
}

/**
 * paint の入出庫記録 (mutation)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - paint_stocks の find-or-create + count 増減 と paint_events insert を
 *   db.batch([...]) で atomic 実行 (D1 は interactive tx 非対応)
 * - count < 0 は DB の CHECK(count>=0) で拒否 → batch 全体 rollback。
 *   コードは事前チェックを持たず CHECK エラーを user-facing に翻訳するのみ
 */
export const addPaintEvent = createServerFn({ method: 'POST' })
  .inputValidator(addPaintEventInput)
  .handler(async ({ data }): Promise<PaintEvent> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

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

    // SQLite evaluates CHECK(count >= 0) on the INSERT-candidate row *before*
    // resolving the unique conflict into DO UPDATE. If we use raw delta (negative
    // for a release) as the candidate count, even a valid release on an existing
    // row (e.g. count=1, delta=-1 → result 0) fails the CHECK because the
    // phantom candidate count=-1 is evaluated first.
    //
    // Fix: make the candidate count the TRUE resulting value:
    //   (existing count, or 0 if no row) + delta
    // Both conflict paths then see the same value as the post-update result,
    // so CHECK fires correctly in all cases.
    const nextCount = sql<number>`(select coalesce((select ${paintStocks.count} from ${paintStocks} where ${paintStocks.userId} = ${userId} and ${paintStocks.paintId} = ${data.paintId}), 0) + ${data.delta})`

    try {
      await db.batch([
        db
          .insert(paintStocks)
          .values({ userId, paintId: data.paintId, count: nextCount })
          .onConflictDoUpdate({
            target: [paintStocks.userId, paintStocks.paintId],
            set: { count: sql`${paintStocks.count} + ${data.delta}` },
          }),
        db.insert(paintEvents).values(event),
      ])
    } catch (err) {
      if (isStockCheckViolation(err)) {
        throw new Error('在庫が不足しています（在庫を負の数にはできません）', { cause: err })
      }
      throw err
    }

    return event
  })
