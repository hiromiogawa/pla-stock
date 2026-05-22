import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects, projectPhotos } from '~/entities/project/schema'
import type { ProjectPhoto } from '~/entities/project'
import { extForMime, parseAddProjectPhotoInput } from './schemas'

/**
 * project に写真を追加する（mutation）。
 *
 * - 入力は FormData（file / projectId / caption / takenAt）。userId は
 *   handler 内 auth() 由来（client 入力に含めない = IDOR 防止）
 * - 対象 project の所有を確認してから R2 put + project_photos INSERT
 * - R2 key は `{userId}/{yyyy}/{mm}/{uuid}.{ext}`、Content-Type は R2 の
 *   httpMetadata に保存（配信 route が返す）
 * - R2 と D1 は跨いだ tx を組めないため put → insert の順。insert 失敗時のみ
 *   put 済み R2 オブジェクトを補償削除して orphan を防ぐ
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
      await db.insert(projectPhotos).values(photo)
    } catch (err) {
      await env.BUCKET.delete(r2Key)
      throw err
    }

    return photo
  })
