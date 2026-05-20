import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects } from '~/entities/project/schema'
import type { Project } from '~/entities/project'
import { updateProjectServerInput } from './schemas'

/**
 * プロジェクトを更新する (name/description/status/startedAt/completedAt)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - WHERE id=? AND user_id=? で他人の project には書き込めない
 * - 該当行が無ければ null を返す (not found / forbidden を区別しない)
 * - kit 在庫への影響なし (作成/削除でのみ kit_events を触る)
 */
export const updateProject = createServerFn({ method: 'POST' })
  .inputValidator(updateProjectServerInput)
  .handler(async ({ data }): Promise<Project | null> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)

    const updated = await db
      .update(projects)
      .set(data.patch)
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
      .returning()

    return updated[0] ?? null
  })
