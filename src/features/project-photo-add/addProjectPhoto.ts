import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import type { ProjectPhoto } from '~/entities/project'
import { projects } from '~/entities/project/schema'
import { createDb } from '~/shared/lib/db/client'
import { addProjectPhotoToDb } from './addProjectPhotoToDb'
import { extForMime, parseAddProjectPhotoInput } from './schemas'

/**
 * project に写真を追加する（mutation server fn）。
 *
 * - 入力は FormData（file / projectId / caption / takenAt）。userId は
 *   handler 内 auth() 由来（client 入力に含めない = IDOR 防止）
 * - 所有確認を R2 put **前** に実施 (不正リクエストで R2 put + 補償削除が走るのを防ぐ)。
 *   addProjectPhotoToDb 内でも所有確認するため defense-in-depth
 * - R2 と D1 は跨いだ tx を組めないため put → insert の順。insert 失敗時のみ
 *   put 済み R2 オブジェクトを補償削除して orphan を防ぐ
 * - DB ロジック (所有確認 + INSERT) は addProjectPhotoToDb に委譲。R2 put /
 *   補償削除と r2Key 生成は env 依存のため server fn 側に残す
 */
export const addProjectPhoto = createServerFn({ method: 'POST' })
  .inputValidator(parseAddProjectPhotoInput)
  .handler(async ({ data }): Promise<ProjectPhoto> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

    const owned = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
      .get()
    if (!owned) throw new Error('対象のプロジェクトが見つかりません')

    const now = new Date()
    const yyyy = now.getUTCFullYear()
    const month = String(now.getUTCMonth() + 1).padStart(2, '0')
    const r2Key = `${userId}/${yyyy}/${month}/${crypto.randomUUID()}.${extForMime(data.file.type)}`

    await env.BUCKET.put(r2Key, await data.file.arrayBuffer(), {
      httpMetadata: { contentType: data.file.type },
    })

    const photo: ProjectPhoto = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      url: `/photos/${r2Key}`,
      r2Key,
      caption: data.caption,
      takenAt: data.takenAt,
    }

    try {
      return await addProjectPhotoToDb(db, userId, { projectId: data.projectId, photo })
    } catch (err) {
      await env.BUCKET.delete(r2Key)
      throw err
    }
  })
