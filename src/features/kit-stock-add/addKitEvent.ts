import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import type { KitEvent } from '~/entities/kit'
import { createDb } from '~/shared/lib/db/client'
import { addKitEventToDb } from './addKitEventToDb'
import { addKitEventInput } from './schemas'

/**
 * kit の入出庫記録 (mutation server fn)。
 *
 * - userId は handler 内 auth() 由来 (client 入力に含めない = IDOR 防止)
 * - DB ロジックは addKitEventToDb に委譲 (pure node でテスト可能、ADR-0016)
 */
export const addKitEvent = createServerFn({ method: 'POST' })
  .inputValidator(addKitEventInput)
  .handler(async ({ data }): Promise<KitEvent> => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return addKitEventToDb(db, userId, data)
  })
