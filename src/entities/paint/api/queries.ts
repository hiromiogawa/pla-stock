import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq, gt } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { paints, paintStocks, paintEvents } from '../schema'
import { paintIdInput } from './schemas'

/**
 * paint ドメインの read query (Drizzle + D1 server fn)。
 *
 * 配置規約 (ADR-0008): read query は entities/{domain}/api/queries.ts、mutation は features/。
 *
 * - paints master (全ユーザー共通カタログ) は auth 不要
 * - paint_stocks / paint_events は per-user。userId は handler 内で Clerk auth() から
 *   取得し WHERE 条件に使う (client 入力の userId は信用しない = IDOR 防止)
 * - mock の挙動を保つため orderBy は付けない (behavior-preserving swap)
 */

export const getPaints = createServerFn({ method: 'GET' }).handler(async () => {
  const db = createDb(env.DB)
  return db.select().from(paints)
})

export const getPaint = createServerFn({ method: 'GET' })
  .inputValidator(paintIdInput)
  .handler(async ({ data }) => {
    const db = createDb(env.DB)
    const rows = await db.select().from(paints).where(eq(paints.id, data.paintId)).limit(1)
    return rows[0] ?? null
  })

export const getPaintStock = createServerFn({ method: 'GET' })
  .inputValidator(paintIdInput)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    const rows = await db
      .select()
      .from(paintStocks)
      .where(and(eq(paintStocks.userId, userId), eq(paintStocks.paintId, data.paintId)))
      .limit(1)
    return rows[0] ?? null
  })

export const getPaintStocksWithStock = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  const db = createDb(env.DB)
  return db
    .select()
    .from(paintStocks)
    .where(and(eq(paintStocks.userId, userId), gt(paintStocks.count, 0)))
})

export const getPaintEvents = createServerFn({ method: 'GET' })
  .inputValidator(paintIdInput)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return db
      .select()
      .from(paintEvents)
      .where(and(eq(paintEvents.userId, userId), eq(paintEvents.paintId, data.paintId)))
  })

export const getPaintEventsAll = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  const db = createDb(env.DB)
  return db.select().from(paintEvents).where(eq(paintEvents.userId, userId))
})
