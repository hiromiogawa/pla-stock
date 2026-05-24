import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import type { Project } from '~/entities/project'
import { createDb } from '~/shared/lib/db/client'
import { updateProjectServerInput } from './schemas'
import { updateProjectToDb } from './updateProjectToDb'

/**
 * プロジェクトを更新する (mutation server fn)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - DB ロジックは updateProjectToDb に委譲 (pure node でテスト可能、ADR-0016)
 */
export const updateProject = createServerFn({ method: 'POST' })
  .inputValidator(updateProjectServerInput)
  .handler(async ({ data }): Promise<Project | null> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return updateProjectToDb(db, userId, data)
  })
