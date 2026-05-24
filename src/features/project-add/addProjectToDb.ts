import { sql } from 'drizzle-orm'
import { kitEvents, kitStocks } from '~/entities/kit/schema'
import type { Project } from '~/entities/project'
import { projects } from '~/entities/project/schema'
import { type CompatibleDb, isD1Db, isStockCheckViolation } from '~/shared/lib/db/compat'

type AddProjectData = {
  kitId: string
  name: string
  description?: string | null
}

/**
 * project 作成 mutation の DB ロジック本体。auth / env から分離した純粋関数で、
 * production の D1 でも test の in-memory better-sqlite3 でも動く。
 *
 * 動作:
 * - projects insert / kit_stocks upsert (-1) / kit_events insert を atomic に実行
 * - kit_stocks.count CHECK(count>=0) 違反時は batch 全体 rollback (projects 行も巻き戻る)
 * - INSERT 候補 count は (existing or 0) + (-1) の真の結果値 (ADR-0007 FAIL-003)
 * - status は 'planning' で初期化
 */
export async function addProjectToDb(
  db: CompatibleDb,
  userId: string,
  data: AddProjectData,
): Promise<Project> {
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

  const nextCount = sql<number>`(select coalesce((select ${kitStocks.count} from ${kitStocks} where ${kitStocks.userId} = ${userId} and ${kitStocks.kitId} = ${data.kitId}), 0) + (-1))`

  const buildInsertProject = (target: CompatibleDb) => target.insert(projects).values(project)
  const buildUpsertStock = (target: CompatibleDb) =>
    target
      .insert(kitStocks)
      .values({ userId, kitId: data.kitId, count: nextCount })
      .onConflictDoUpdate({
        target: [kitStocks.userId, kitStocks.kitId],
        set: { count: sql`${kitStocks.count} - 1` },
      })
  const buildInsertEvent = (target: CompatibleDb) => target.insert(kitEvents).values(kitEvent)

  try {
    if (isD1Db(db)) {
      await db.batch([buildInsertProject(db), buildUpsertStock(db), buildInsertEvent(db)])
    } else {
      db.transaction((tx) => {
        buildInsertProject(tx).run()
        buildUpsertStock(tx).run()
        buildInsertEvent(tx).run()
      })
    }
  } catch (err) {
    if (isStockCheckViolation(err)) {
      throw new Error('在庫が不足しています（キットの在庫がありません）', { cause: err })
    }
    throw err
  }

  return project
}
