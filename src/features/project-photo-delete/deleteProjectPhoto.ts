import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects, projectPhotos } from '~/entities/project/schema'
import { deleteProjectPhotoInput } from './schemas'

/**
 * project の写真を削除する（mutation）。
 *
 * - userId は handler 内 auth() 由来（client 入力に含めない = IDOR 防止）
 * - project_photos は userId 列を持たないため projects を INNER JOIN して
 *   所有確認（projects.userId = auth userId）。同時に r2Key を取得
 * - D1 DELETE → R2 delete の順。R2 delete 失敗は握り潰す（orphan は無害、
 *   D1 行は既に削除済み）。逆順だと R2 成功 / D1 失敗で壊れ画像が残る
 * - 写真が無い / 非所有なら false（hook 側は何もしない）
 */
export const deleteProjectPhoto = createServerFn({ method: 'POST' })
  .inputValidator(deleteProjectPhotoInput)
  .handler(async ({ data }): Promise<boolean> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

    const row = await db
      .select({ id: projectPhotos.id, r2Key: projectPhotos.r2Key })
      .from(projectPhotos)
      .innerJoin(projects, eq(projectPhotos.projectId, projects.id))
      .where(and(eq(projectPhotos.id, data.photoId), eq(projects.userId, userId)))
      .get()
    if (!row) return false

    await db.delete(projectPhotos).where(eq(projectPhotos.id, data.photoId))

    if (row.r2Key) {
      try {
        await env.BUCKET.delete(row.r2Key)
      } catch {
        // orphan R2 オブジェクトは無害。D1 行は削除済みなので成功扱いにする。
      }
    }
    return true
  })
