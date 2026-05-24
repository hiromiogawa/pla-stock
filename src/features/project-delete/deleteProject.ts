import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { createDb } from '~/shared/lib/db/client'
import { deleteProjectServerInput } from './schemas'
import { deleteProjectToDb } from './deleteProjectToDb'

/**
 * プロジェクトを削除する (mutation server fn)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - DB ロジックは deleteProjectToDb に委譲 (pure node でテスト可能、ADR-0016)
 * - R2 写真ファイルの物理削除は本 PR scope 外 (Phase D で schema cascade と一体化検討)
 */
export const deleteProject = createServerFn({ method: 'POST' })
  .inputValidator(deleteProjectServerInput)
  .handler(async ({ data }): Promise<boolean> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return deleteProjectToDb(db, userId, data)
  })
