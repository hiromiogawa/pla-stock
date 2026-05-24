import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import type { ProjectPaintUse } from '~/entities/projectPaintUse'
import { createDb } from '~/shared/lib/db/client'
import { addProjectPaintUseToDb } from './addProjectPaintUseToDb'
import { projectPaintUseServerInput } from './schemas'

/**
 * Project ↔ Paint master の紐付けを追加する (mutation server fn)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - DB ロジックは addProjectPaintUseToDb に委譲 (pure node でテスト可能、ADR-0016)
 */
export const addProjectPaintUse = createServerFn({ method: 'POST' })
  .inputValidator(projectPaintUseServerInput)
  .handler(async ({ data }): Promise<ProjectPaintUse> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return addProjectPaintUseToDb(db, userId, data)
  })
