import { and, eq, sql } from 'drizzle-orm'
import type { Project } from '~/entities/project'
import { kitEvents, kitStocks } from '~/entities/kit/schema'
import { projectPhotos, projects } from '~/entities/project/schema'
import { type CompatibleDb, isD1Db } from '~/shared/lib/db/compat'

type DeleteProjectData = {
  projectId: string
}

async function findOwnedProject(
  db: CompatibleDb,
  projectId: string,
  userId: string,
): Promise<Project | undefined> {
  if (isD1Db(db)) {
    const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    return rows[0]
  }
  const rows = db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .all()
  return rows[0]
}

/**
 * project 削除 mutation の DB ロジック本体。auth / env から分離した純粋関数で、
 * production の D1 でも test の in-memory better-sqlite3 でも動く。
 *
 * 動作:
 * - 所有確認 (WHERE id=? AND user_id=?) → 該当無しなら false 返却
 * - status='planning' のみ kit 在庫を +1 戻す (kit_events insert + kit_stocks upsert)
 * - project_paint_use は schema の onDelete: 'cascade' で自動削除
 * - project_photos は schema cascade 未設定のため batch 内で先に明示削除
 *   (R2 物理削除は server fn 側責務、Phase D で schema cascade 検討予定)
 * - 戻し有/無で batch 構成が変わるため if 分岐で 2 batch を出し分け
 */
export async function deleteProjectToDb(
  db: CompatibleDb,
  userId: string,
  data: DeleteProjectData,
): Promise<boolean> {
  const existing = await findOwnedProject(db, data.projectId, userId)
  if (!existing) return false

  if (existing.status === 'planning') {
    const kitEvent = {
      id: crypto.randomUUID(),
      userId,
      kitId: existing.kitId,
      delta: 1,
      reason: 'project' as const,
      projectId: existing.id,
      purchasedAt: null,
      priceYen: null,
      purchaseLocation: null,
      note: 'returned from cancelled planning',
      createdAt: new Date(),
    }
    const nextCount = sql<number>`(select coalesce((select ${kitStocks.count} from ${kitStocks} where ${kitStocks.userId} = ${userId} and ${kitStocks.kitId} = ${existing.kitId}), 0) + 1)`

    const buildUpsertStock = (target: CompatibleDb) =>
      target
        .insert(kitStocks)
        .values({ userId, kitId: existing.kitId, count: nextCount })
        .onConflictDoUpdate({
          target: [kitStocks.userId, kitStocks.kitId],
          set: { count: sql`${kitStocks.count} + 1` },
        })
    const buildInsertEvent = (target: CompatibleDb) => target.insert(kitEvents).values(kitEvent)
    const buildDeletePhotos = (target: CompatibleDb) =>
      target.delete(projectPhotos).where(eq(projectPhotos.projectId, data.projectId))
    const buildDeleteProject = (target: CompatibleDb) =>
      target
        .delete(projects)
        .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))

    if (isD1Db(db)) {
      await db.batch([
        buildUpsertStock(db),
        buildInsertEvent(db),
        buildDeletePhotos(db),
        buildDeleteProject(db),
      ])
    } else {
      db.transaction((tx) => {
        buildUpsertStock(tx).run()
        buildInsertEvent(tx).run()
        buildDeletePhotos(tx).run()
        buildDeleteProject(tx).run()
      })
    }
  } else {
    const buildDeletePhotos = (target: CompatibleDb) =>
      target.delete(projectPhotos).where(eq(projectPhotos.projectId, data.projectId))
    const buildDeleteProject = (target: CompatibleDb) =>
      target
        .delete(projects)
        .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))

    if (isD1Db(db)) {
      await db.batch([buildDeletePhotos(db), buildDeleteProject(db)])
    } else {
      db.transaction((tx) => {
        buildDeletePhotos(tx).run()
        buildDeleteProject(tx).run()
      })
    }
  }

  return true
}
