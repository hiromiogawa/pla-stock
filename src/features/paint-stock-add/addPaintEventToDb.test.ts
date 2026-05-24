import { and, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { paintEvents, paintStocks, paints } from '~/entities/paint/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestPaint } from '~/test-utils/factories/paint'
import { addPaintEventToDb } from './addPaintEventToDb'

describe('addPaintEventToDb', () => {
  const USER_ID = 'user-test-1'
  let db: BetterSQLite3Database
  let paintId: string

  beforeEach(() => {
    db = createTestDb()
    const paint = createTestPaint()
    paintId = paint.id
    db.insert(paints).values(paint).run()
  })

  it('在庫 1 → delta -1 (sell) → success (stock=0、event 1 件・全 fields 記録)', async () => {
    db.insert(paintStocks).values({ userId: USER_ID, paintId, count: 1 }).run()

    const event = await addPaintEventToDb(db, USER_ID, {
      paintId,
      delta: -1,
      reason: 'sell',
      priceYen: 200,
      purchaseLocation: 'shop-a',
      note: 'sold',
    })

    expect(event.delta).toBe(-1)
    expect(event.reason).toBe('sell')
    expect(event.priceYen).toBe(200)
    expect(event.purchaseLocation).toBe('shop-a')
    expect(event.note).toBe('sold')
    expect(event.userId).toBe(USER_ID)
    expect(event.paintId).toBe(paintId)
    expect(event.id).toMatch(/^[0-9a-f-]{36}$/)

    const stock = db.select().from(paintStocks).where(eq(paintStocks.paintId, paintId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(paintEvents).where(eq(paintEvents.paintId, paintId)).all()
    expect(events).toHaveLength(1)
    expect(events[0]?.delta).toBe(-1)
    expect(events[0]?.priceYen).toBe(200)
  })

  it('既存 stock 行なし + delta +1 (purchase) → stock=1 行作成・event 1 件 (optional fields 含む)', async () => {
    const event = await addPaintEventToDb(db, USER_ID, {
      paintId,
      delta: 1,
      reason: 'purchase',
      purchasedAt: '2026-05-24',
      priceYen: 500,
      purchaseLocation: 'store-x',
      note: 'first buy',
    })

    expect(event.delta).toBe(1)
    expect(event.purchasedAt).toBe('2026-05-24')
    expect(event.priceYen).toBe(500)
    expect(event.purchaseLocation).toBe('store-x')
    expect(event.note).toBe('first buy')

    const stock = db.select().from(paintStocks).where(eq(paintStocks.paintId, paintId)).get()
    expect(stock?.count).toBe(1)
    expect(stock?.userId).toBe(USER_ID)

    const events = db.select().from(paintEvents).where(eq(paintEvents.paintId, paintId)).all()
    expect(events).toHaveLength(1)
  })

  it('在庫 0 → delta -1 (sell) → CHECK 違反で user-facing message を throw、batch rollback で event 未記録', async () => {
    db.insert(paintStocks).values({ userId: USER_ID, paintId, count: 0 }).run()

    await expect(
      addPaintEventToDb(db, USER_ID, {
        paintId,
        delta: -1,
        reason: 'sell',
      }),
    ).rejects.toThrow(/在庫が不足しています/)

    const stock = db.select().from(paintStocks).where(eq(paintStocks.paintId, paintId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(paintEvents).where(eq(paintEvents.paintId, paintId)).all()
    expect(events).toHaveLength(0)
  })

  it('在庫 2 → delta -5 (gift) → 結果値 -3 で CHECK 違反、stock=2 のまま、event 未記録 (batch atomicity)', async () => {
    db.insert(paintStocks).values({ userId: USER_ID, paintId, count: 2 }).run()

    await expect(
      addPaintEventToDb(db, USER_ID, {
        paintId,
        delta: -5,
        reason: 'gift',
      }),
    ).rejects.toThrow(/在庫が不足しています/)

    const stock = db.select().from(paintStocks).where(eq(paintStocks.paintId, paintId)).get()
    expect(stock?.count).toBe(2)

    const events = db.select().from(paintEvents).where(eq(paintEvents.paintId, paintId)).all()
    expect(events).toHaveLength(0)
  })

  it('連続呼出: stock=3 から +2 → -1 → stock=4・event 2 件 (累積)', async () => {
    db.insert(paintStocks).values({ userId: USER_ID, paintId, count: 3 }).run()

    await addPaintEventToDb(db, USER_ID, { paintId, delta: 2, reason: 'purchase' })
    await addPaintEventToDb(db, USER_ID, { paintId, delta: -1, reason: 'discard' })

    const stock = db.select().from(paintStocks).where(eq(paintStocks.paintId, paintId)).get()
    expect(stock?.count).toBe(4)

    const events = db
      .select()
      .from(paintEvents)
      .where(eq(paintEvents.paintId, paintId))
      .all()
      .sort((left, right) => left.delta - right.delta)
    expect(events).toHaveLength(2)
    expect(events[0]?.delta).toBe(-1)
    expect(events[0]?.reason).toBe('discard')
    expect(events[1]?.delta).toBe(2)
    expect(events[1]?.reason).toBe('purchase')
  })

  it('異なる paint への delta は独立 (paint A: +1 → stock=1、paint B: +3 → stock=3、互いに影響なし)', async () => {
    const paintB = createTestPaint({ code: 'TEST-002' })
    db.insert(paints).values(paintB).run()

    await addPaintEventToDb(db, USER_ID, { paintId, delta: 1, reason: 'purchase' })
    await addPaintEventToDb(db, USER_ID, { paintId: paintB.id, delta: 3, reason: 'purchase' })

    const stockA = db.select().from(paintStocks).where(eq(paintStocks.paintId, paintId)).get()
    const stockB = db.select().from(paintStocks).where(eq(paintStocks.paintId, paintB.id)).get()
    expect(stockA?.count).toBe(1)
    expect(stockB?.count).toBe(3)

    const eventsA = db.select().from(paintEvents).where(eq(paintEvents.paintId, paintId)).all()
    const eventsB = db.select().from(paintEvents).where(eq(paintEvents.paintId, paintB.id)).all()
    expect(eventsA).toHaveLength(1)
    expect(eventsB).toHaveLength(1)
  })

  it('異なる userId の stock 行は独立 (PK が userId+paintId)', async () => {
    const otherUser = 'user-test-2'
    db.insert(paintStocks).values({ userId: otherUser, paintId, count: 10 }).run()

    await addPaintEventToDb(db, USER_ID, { paintId, delta: 1, reason: 'purchase' })

    const myStock = db
      .select()
      .from(paintStocks)
      .where(and(eq(paintStocks.userId, USER_ID), eq(paintStocks.paintId, paintId)))
      .get()
    const otherStock = db
      .select()
      .from(paintStocks)
      .where(and(eq(paintStocks.userId, otherUser), eq(paintStocks.paintId, paintId)))
      .get()
    expect(myStock?.count).toBe(1)
    expect(otherStock?.count).toBe(10)
  })
})
