import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects } from '~/entities/project/schema'
import { projectPaintUse } from '~/entities/projectPaintUse/schema'
import { projectPaintUseServerInput } from './schemas'

/**
 * Project ↔ Paint master の紐付けを削除する。
 *
 * - userId は handler 内 auth() 由来 (IDOR 防止)。指定された project が
 *   自分の所有でない場合は false を返す
 * - 該当 link が無い場合 (既に削除済 等) も false
 * - count 非影響
 */
export const removeProjectPaintUse = createServerFn({ method: 'POST' })
  .inputValidator(projectPaintUseServerInput)
  .handler(async ({ data }): Promise<boolean> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

    // 所有確認 (IDOR 防止)
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
      .get()
    if (!project) return false

    const deleted = await db
      .delete(projectPaintUse)
      .where(
        and(
          eq(projectPaintUse.projectId, data.projectId),
          eq(projectPaintUse.paintId, data.paintId),
        ),
      )
      .returning()

    return deleted.length > 0
  })
