import { and, eq } from 'drizzle-orm'
import { projectPhotos, projects } from '~/entities/project/schema'
import { type CompatibleDb, isD1Db } from '~/shared/lib/db/compat'

type DeleteProjectPhotoData = {
  photoId: string
}

type DeleteProjectPhotoResult = {
  deleted: boolean
  /** R2 補償削除に server fn 側で使う key (deleted=true のときのみ意味あり)。 */
  r2Key: string | null
}

/**
 * project_photos DELETE mutation の DB ロジック本体。auth / env / R2 から
 * 分離した純粋関数で、production の D1 でも test の in-memory better-sqlite3 でも動く。
 *
 * 動作:
 * - project_photos は userId 列を持たないため projects を INNER JOIN して所有確認
 *   (projects.userId = auth userId)。同時に r2Key を取得
 * - 写真が無い / 非所有なら `{ deleted: false, r2Key: null }`
 * - 該当ありなら project_photos DELETE → `{ deleted: true, r2Key }` を返す
 *
 * Note:
 * - R2 物理削除は server fn 側責務 (Bucket は DB と異なる ledger、tx を跨げない)
 * - R2 削除順序: D1 DELETE → R2 delete (R2 失敗は orphan で無害、逆順は壊れ画像が残る)
 */
export async function deleteProjectPhotoToDb(
  db: CompatibleDb,
  userId: string,
  data: DeleteProjectPhotoData,
): Promise<DeleteProjectPhotoResult> {
  let rows: { id: string; r2Key: string | null }[]
  if (isD1Db(db)) {
    rows = await db
      .select({ id: projectPhotos.id, r2Key: projectPhotos.r2Key })
      .from(projectPhotos)
      .innerJoin(projects, eq(projectPhotos.projectId, projects.id))
      .where(and(eq(projectPhotos.id, data.photoId), eq(projects.userId, userId)))
  } else {
    rows = db
      .select({ id: projectPhotos.id, r2Key: projectPhotos.r2Key })
      .from(projectPhotos)
      .innerJoin(projects, eq(projectPhotos.projectId, projects.id))
      .where(and(eq(projectPhotos.id, data.photoId), eq(projects.userId, userId)))
      .all()
  }
  const row = rows[0]
  if (!row) return { deleted: false, r2Key: null }

  await db.delete(projectPhotos).where(eq(projectPhotos.id, data.photoId))

  return { deleted: true, r2Key: row.r2Key }
}
