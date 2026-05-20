import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects } from '~/entities/project/schema'
import { projectPaintUse } from '~/entities/projectPaintUse/schema'
import type { ProjectPaintUse } from '~/entities/projectPaintUse'
import { projectPaintUseServerInput } from './schemas'

/**
 * Project ↔ Paint master の紐付けを追加する。
 *
 * - userId は handler 内 auth() 由来 (IDOR 防止)。指定された project が
 *   自分の所有でない場合は 'Forbidden' を throw
 * - 重複追加は `onConflictDoNothing` で握りつぶし (composite PK が衝突)
 * - count 非影響 (paint 在庫は project と独立)
 */
export const addProjectPaintUse = createServerFn({ method: 'POST' })
  .inputValidator(projectPaintUseServerInput)
  .handler(async ({ data }): Promise<ProjectPaintUse> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

    // 所有確認 (IDOR 防止)
    const project = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
      .get()
    if (!project) throw new Error('Forbidden')

    const newLink: ProjectPaintUse = {
      projectId: data.projectId,
      paintId: data.paintId,
      createdAt: new Date(),
    }

    await db.insert(projectPaintUse).values(newLink).onConflictDoNothing()

    return newLink
  })
