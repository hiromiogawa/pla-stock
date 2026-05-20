import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { sql } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects } from '~/entities/project/schema'
import { kitStocks, kitEvents } from '~/entities/kit/schema'
import type { Project } from '~/entities/project'
import { addProjectServerInput } from './schemas'

/**
 * D1/SQLite の在庫 CHECK(count>=0) 制約違反を判定する。
 * paint #98 / kit #115 の同名関数と同型。
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
 * プロジェクトを作成し、kit 在庫を -1 する。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - projects insert / kit_stocks upsert / kit_events insert を **1 つの db.batch** で
 *   atomic 実行。kit_stocks の CHECK(count>=0) 違反時は batch 全体 rollback で
 *   projects 行も巻き戻る (在庫不足のキットで project を作れない保証)
 * - INSERT 候補 count は (existing or 0) + (-1) の真の結果値 (ADR-0007 FAIL-003)
 * - status は 'planning' で初期化
 */
export const addProject = createServerFn({ method: 'POST' })
  .inputValidator(addProjectServerInput)
  .handler(async ({ data }): Promise<Project> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

    const project: Project = {
      id: crypto.randomUUID(),
      userId,
      kitId: data.kitId,
      name: data.name,
      description: data.description ?? null,
      status: 'planning',
      startedAt: null,
      completedAt: null,
    }

    const kitEvent = {
      id: crypto.randomUUID(),
      userId,
      kitId: data.kitId,
      delta: -1,
      reason: 'project' as const,
      projectId: project.id,
      purchasedAt: null,
      priceYen: null,
      purchaseLocation: null,
      note: null,
      createdAt: new Date(),
    }

    // FAIL-003: INSERT 候補値 = (existing or 0) + delta の真の結果値。
    // 詳細は features/kit-stock-add/addKitEvent.ts のコメントを参照。
    const nextCount = sql<number>`(select coalesce((select ${kitStocks.count} from ${kitStocks} where ${kitStocks.userId} = ${userId} and ${kitStocks.kitId} = ${data.kitId}), 0) + (-1))`

    try {
      await db.batch([
        db.insert(projects).values(project),
        db
          .insert(kitStocks)
          .values({ userId, kitId: data.kitId, count: nextCount })
          .onConflictDoUpdate({
            target: [kitStocks.userId, kitStocks.kitId],
            set: { count: sql`${kitStocks.count} - 1` },
          }),
        db.insert(kitEvents).values(kitEvent),
      ])
    } catch (err) {
      if (isStockCheckViolation(err)) {
        throw new Error('在庫が不足しています（キットの在庫がありません）', { cause: err })
      }
      throw err
    }

    return project
  })
