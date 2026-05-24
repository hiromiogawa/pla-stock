import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { createDb } from '~/shared/lib/db/client'
import { removeProjectPaintUseToDb } from './removeProjectPaintUseToDb'
import { projectPaintUseServerInput } from './schemas'

/**
 * Project ↔ Paint master の紐付けを削除する (mutation server fn)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - DB ロジックは removeProjectPaintUseToDb に委譲 (pure node でテスト可能、ADR-0016)
 */
export const removeProjectPaintUse = createServerFn({ method: 'POST' })
  .inputValidator(projectPaintUseServerInput)
  .handler(async ({ data }): Promise<boolean> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return removeProjectPaintUseToDb(db, userId, data)
  })
