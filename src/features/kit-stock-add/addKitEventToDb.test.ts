import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { kitEvents, kitStocks, kits } from '~/entities/kit/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestKit } from '~/test-utils/factories/kit'
import { addKitEventToDb } from './addKitEventToDb'

describe('addKitEventToDb', () => {
  const USER_ID = 'user-test-1'
  let db: BetterSQLite3Database
  let kitId: string

  beforeEach(() => {
    db = createTestDb()
    const kit = createTestKit()
    kitId = kit.id
    db.insert(kits).values(kit).run()
  })

  it('在庫 1 → delta -1 → success (stock=0、event recorded)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 1 }).run()

    const event = await addKitEventToDb(db, USER_ID, {
      kitId,
      delta: -1,
      reason: 'sell',
    })

    expect(event.delta).toBe(-1)
    expect(event.reason).toBe('sell')

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(1)
    expect(events[0]?.delta).toBe(-1)
  })

  it('在庫 0 → delta -1 → CHECK 違反 (user-facing message を throw、event 未記録)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 0 }).run()

    await expect(
      addKitEventToDb(db, USER_ID, {
        kitId,
        delta: -1,
        reason: 'sell',
      }),
    ).rejects.toThrow(/在庫が不足しています/)

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(0)
  })

  it('既存 stock 行が無い状態で purchase delta +1 → stock=1、event recorded', async () => {
    const event = await addKitEventToDb(db, USER_ID, {
      kitId,
      delta: 1,
      reason: 'purchase',
      priceYen: 1000,
    })

    expect(event.delta).toBe(1)
    expect(event.priceYen).toBe(1000)

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(1)
  })
})
