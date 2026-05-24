import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import type { PaintEvent } from '~/entities/paint'
import { createDb } from '~/shared/lib/db/client'
import { addPaintEventToDb } from './addPaintEventToDb'
import { addPaintEventInput } from './schemas'

/**
 * paint の入出庫記録 (mutation server fn)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - DB ロジックは addPaintEventToDb に委譲 (pure node でテスト可能、ADR-0016)
 */
export const addPaintEvent = createServerFn({ method: 'POST' })
  .inputValidator(addPaintEventInput)
  .handler(async ({ data }): Promise<PaintEvent> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return addPaintEventToDb(db, userId, data)
  })
