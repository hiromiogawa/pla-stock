import { and, eq } from 'drizzle-orm'
import { projects } from '~/entities/project/schema'
import type { ProjectPaintUse } from '~/entities/project-paint-use'
import { projectPaintUse } from '~/entities/project-paint-use/schema'
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
 * Project ↔ Paint master の紐付けを追加する mutation の DB ロジック本体。
 *
 * 動作:
 * - 所有確認 (projects.userId == userId) → 自分の project でなければ 'Forbidden' を throw
 * - 重複追加は `onConflictDoNothing` で握りつぶし (composite PK が衝突)
 * - count 非影響 (paint 在庫は project と独立)
 */
export async function addProjectPaintUseToDb(
  db: CompatibleDb,
  userId: string,
  data: ProjectPaintUseData,
): Promise<ProjectPaintUse> {
  if (!(await isOwnedProject(db, data.projectId, userId))) throw new Error('Forbidden')

  const newLink: ProjectPaintUse = {
    projectId: data.projectId,
    paintId: data.paintId,
    createdAt: new Date(),
  }

  await db.insert(projectPaintUse).values(newLink).onConflictDoNothing()

  return newLink
}
