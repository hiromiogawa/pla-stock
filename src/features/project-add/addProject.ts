import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import type { Project } from '~/entities/project'
import { createDb } from '~/shared/lib/db/client'
import { addProjectToDb } from './addProjectToDb'
import { addProjectServerInput } from './schemas'

/**
 * プロジェクトを作成し、kit 在庫を -1 する (mutation server fn)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - DB ロジックは addProjectToDb に委譲 (pure node でテスト可能、ADR-0016)
 */
export const addProject = createServerFn({ method: 'POST' })
  .inputValidator(addProjectServerInput)
  .handler(async ({ data }): Promise<Project> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return addProjectToDb(db, userId, data)
  })
