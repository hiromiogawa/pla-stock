import { and, eq } from 'drizzle-orm'
import type { ProjectPhoto } from '~/entities/project'
import { projectPhotos, projects } from '~/entities/project/schema'
import { type CompatibleDb, isD1Db } from '~/shared/lib/db/compat'

type AddProjectPhotoData = {
  projectId: string
  photo: ProjectPhoto
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
 * project_photos INSERT mutation の DB ロジック本体。auth / env / R2 から
 * 分離した純粋関数で、production の D1 でも test の in-memory better-sqlite3 でも動く。
 *
 * 動作:
 * - 所有確認 (projects.userId == userId) → 自分の project でなければ '対象のプロジェクトが見つかりません' を throw
 * - project_photos INSERT (r2Key / caption / takenAt 含む)
 *
 * Note:
 * - R2 put / 補償削除は server fn 側責務 (Bucket は DB と異なる ledger)
 * - photo の r2Key / url 生成も server fn 側 (env 依存)
 */
export async function addProjectPhotoToDb(
  db: CompatibleDb,
  userId: string,
  data: AddProjectPhotoData,
): Promise<ProjectPhoto> {
  if (!(await isOwnedProject(db, data.projectId, userId))) {
    throw new Error('対象のプロジェクトが見つかりません')
  }

  await db.insert(projectPhotos).values(data.photo)

  return data.photo
}
