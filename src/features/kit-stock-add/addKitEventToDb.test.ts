import { and, eq } from 'drizzle-orm'
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

  // --- 境界条件追加 (#201) ---

  it('在庫 5 → delta -5 → stock=0 ちょうど (CHECK 境界、result==0 は許容)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 5 }).run()

    const event = await addKitEventToDb(db, USER_ID, {
      kitId,
      delta: -5,
      reason: 'sell',
    })

    expect(event.delta).toBe(-5)

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(1)
    expect(events[0]?.delta).toBe(-5)
  })

  it('在庫 5 → delta -6 → 結果値 -1 で CHECK 違反、stock=5 のまま、event 未記録 (batch atomicity)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 5 }).run()

    await expect(
      addKitEventToDb(db, USER_ID, {
        kitId,
        delta: -6,
        reason: 'sell',
      }),
    ).rejects.toThrow(/在庫が不足しています/)

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(5)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(0)
  })

  it('FK 違反: 存在しない kitId → SQLite FOREIGN KEY error で reject、stock / event 未作成', async () => {
    // SQLite core の error message に依存 (drizzle がラップしない素通し)。
    // SQLite 本体文言のため drizzle / better-sqlite3 のマイナーバージョン変更で
    // 変わるリスクは低い。
    await expect(
      addKitEventToDb(db, USER_ID, {
        kitId: 'kit-nonexistent-id',
        delta: 1,
        reason: 'purchase',
      }),
    ).rejects.toThrow(/FOREIGN KEY constraint failed/)

    // beforeEach で kits 1 件は insert 済だが kit_stocks / kit_events は 0 件。
    // この case で発行された UPSERT/INSERT が rollback されていることを全件 0 で確認。
    const allStocks = db.select().from(kitStocks).all()
    expect(allStocks).toHaveLength(0)

    const allEvents = db.select().from(kitEvents).all()
    expect(allEvents).toHaveLength(0)
  })

  it('連続 mutation 累積整合性: +3 purchase → -1 project → -1 sell → stock=1、event 3 件、台帳と stock が一致', async () => {
    await addKitEventToDb(db, USER_ID, { kitId, delta: 3, reason: 'purchase' })
    await addKitEventToDb(db, USER_ID, {
      kitId,
      delta: -1,
      reason: 'project',
      projectId: 'project-test-1',
    })
    await addKitEventToDb(db, USER_ID, { kitId, delta: -1, reason: 'sell' })

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(1)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(3)

    const deltaSum = events.reduce((acc, evt) => acc + evt.delta, 0)
    expect(deltaSum).toBe(1)

    const reasons = events.map((evt) => evt.reason).sort()
    expect(reasons).toEqual(['project', 'purchase', 'sell'])
  })

  it('delta=0 は *ToDb 内で reject しない (production は schema validator (refine non-zero) で reject)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 3 }).run()

    const event = await addKitEventToDb(db, USER_ID, {
      kitId,
      delta: 0,
      reason: 'other',
    })

    expect(event.delta).toBe(0)

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(3)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(1)
    expect(events[0]?.delta).toBe(0)
  })

  it('reason=project + projectId 指定 → event に projectId が弱結合 FK として保存 (kit_events.projectId 列)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 2 }).run()

    const event = await addKitEventToDb(db, USER_ID, {
      kitId,
      delta: -1,
      reason: 'project',
      projectId: 'project-uuid-xyz',
    })

    expect(event.reason).toBe('project')
    expect(event.projectId).toBe('project-uuid-xyz')

    const stored = db.select().from(kitEvents).where(eq(kitEvents.id, event.id)).get()
    expect(stored?.projectId).toBe('project-uuid-xyz')
    expect(stored?.reason).toBe('project')

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(1)
  })

  it('全 optional fields (purchasedAt / priceYen / purchaseLocation / note) 含む purchase が DB に往復で一致保存', async () => {
    const event = await addKitEventToDb(db, USER_ID, {
      kitId,
      delta: 1,
      reason: 'purchase',
      purchasedAt: '2026-04-15',
      priceYen: 4500,
      purchaseLocation: 'ヨドバシカメラ秋葉原',
      note: 'sale 20%',
    })

    expect(event.purchasedAt).toBe('2026-04-15')
    expect(event.priceYen).toBe(4500)
    expect(event.purchaseLocation).toBe('ヨドバシカメラ秋葉原')
    expect(event.note).toBe('sale 20%')

    const stored = db.select().from(kitEvents).where(eq(kitEvents.id, event.id)).get()
    expect(stored?.purchasedAt).toBe('2026-04-15')
    expect(stored?.priceYen).toBe(4500)
    expect(stored?.purchaseLocation).toBe('ヨドバシカメラ秋葉原')
    expect(stored?.note).toBe('sale 20%')

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(1)
  })

  it('batch atomicity: 在庫 2 + reason=project delta=-3 → CHECK -1 → projectId 含む event 行も未記録', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 2 }).run()

    await expect(
      addKitEventToDb(db, USER_ID, {
        kitId,
        delta: -3,
        reason: 'project',
        projectId: 'project-uuid-abc',
      }),
    ).rejects.toThrow(/在庫が不足しています/)

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(2)

    const events = db.select().from(kitEvents).all()
    expect(events).toHaveLength(0)
  })

  it('異なる userId の kit_stocks 行は独立 (composite PK userId+kitId、IDOR 防御に直結)', async () => {
    const otherUser = 'user-test-2'
    db.insert(kitStocks).values({ userId: otherUser, kitId, count: 10 }).run()

    await addKitEventToDb(db, USER_ID, { kitId, delta: 1, reason: 'purchase' })

    const myStock = db
      .select()
      .from(kitStocks)
      .where(and(eq(kitStocks.userId, USER_ID), eq(kitStocks.kitId, kitId)))
      .get()
    const otherStock = db
      .select()
      .from(kitStocks)
      .where(and(eq(kitStocks.userId, otherUser), eq(kitStocks.kitId, kitId)))
      .get()
    expect(myStock?.count).toBe(1)
    expect(otherStock?.count).toBe(10)

    const myEvents = db
      .select()
      .from(kitEvents)
      .where(and(eq(kitEvents.userId, USER_ID), eq(kitEvents.kitId, kitId)))
      .all()
    const otherEvents = db
      .select()
      .from(kitEvents)
      .where(and(eq(kitEvents.userId, otherUser), eq(kitEvents.kitId, kitId)))
      .all()
    expect(myEvents).toHaveLength(1)
    expect(otherEvents).toHaveLength(0)
  })
})
