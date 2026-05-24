import { and, eq } from 'drizzle-orm'
import { projects } from '~/entities/project/schema'
import { projectPaintUse } from '~/entities/projectPaintUse/schema'
import { type CompatibleDb, isD1Db } from '~/shared/lib/db/compat'

type ProjectPaintUseData = {
  projectId: string
  paintId: string
}

async function isOwnedProject(
  db: CompatibleDb,
  projectId: string,
  userId: string,
): Promise<boolean> {
  if (isD1Db(db)) {
    const rows = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    return rows.length > 0
  }
  const rows = db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .all()
  return rows.length > 0
}

/**
 * Project ↔ Paint master の紐付けを削除する mutation の DB ロジック本体。
 *
 * 動作:
 * - 所有確認 (projects.userId == userId) → 自分の project でなければ false
 * - 該当 link が無い場合 (既に削除済 等) も false
 * - count 非影響
 */
export async function removeProjectPaintUseToDb(
  db: CompatibleDb,
  userId: string,
  data: ProjectPaintUseData,
): Promise<boolean> {
  if (!(await isOwnedProject(db, data.projectId, userId))) return false

  const deleted = await db
    .delete(projectPaintUse)
    .where(
      and(eq(projectPaintUse.projectId, data.projectId), eq(projectPaintUse.paintId, data.paintId)),
    )
    .returning()

  return deleted.length > 0
}
