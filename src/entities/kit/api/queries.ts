import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq, gt } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { kits, kitStocks, kitEvents } from '../schema'
import { kitIdInput } from './schemas'

/**
 * kit ドメインの read query (Drizzle + D1 server fn)。
 *
 * 配置規約 (ADR-0008 追補): read query は entities/{domain}/api/queries.ts。
 * mutation は features/。
 *
 * - kits master (全ユーザー共通カタログ) は auth 不要
 * - kit_stocks / kit_events は per-user。userId は handler 内で Clerk auth() から
 *   取得し WHERE 条件に使う (client 入力の userId は信用しない = IDOR 防止)
 * - mock の挙動を保つため orderBy は付けない (behavior-preserving swap)
 */

export const getKits = createServerFn({ method: 'GET' }).handler(async () => {
  const db = createDb(env.DB)
  return db.select().from(kits)
})

export const getKit = createServerFn({ method: 'GET' })
  .inputValidator(kitIdInput)
  .handler(async ({ data }) => {
    const db = createDb(env.DB)
    const rows = await db.select().from(kits).where(eq(kits.id, data.kitId)).limit(1)
    return rows[0] ?? null
  })

export const getKitStock = createServerFn({ method: 'GET' })
  .inputValidator(kitIdInput)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    const rows = await db
      .select()
      .from(kitStocks)
      .where(and(eq(kitStocks.userId, userId), eq(kitStocks.kitId, data.kitId)))
      .limit(1)
    return rows[0] ?? null
  })

export const getKitStocksWithStock = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  const db = createDb(env.DB)
  return db
    .select()
    .from(kitStocks)
    .where(and(eq(kitStocks.userId, userId), gt(kitStocks.count, 0)))
})

export const getKitEvents = createServerFn({ method: 'GET' })
  .inputValidator(kitIdInput)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return db
      .select()
      .from(kitEvents)
      .where(and(eq(kitEvents.userId, userId), eq(kitEvents.kitId, data.kitId)))
  })

export const getKitEventsAll = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  const db = createDb(env.DB)
  return db.select().from(kitEvents).where(eq(kitEvents.userId, userId))
})
