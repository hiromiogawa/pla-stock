import { and, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { kitEvents, kitStocks, kits } from '~/entities/kit/schema'
import { projects } from '~/entities/project/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestKit } from '~/test-utils/factories/kit'
import { addProjectToDb } from './addProjectToDb'

describe('addProjectToDb', () => {
  const USER_ID = 'user-test-1'
  let db: BetterSQLite3Database
  let kitId: string

  beforeEach(() => {
    db = createTestDb()
    const kit = createTestKit()
    kitId = kit.id
    db.insert(kits).values(kit).run()
  })

  it('在庫 1 のキット → project 作成成功 (project insert + stock=0 + kit_event delta=-1 reason=project)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 1 }).run()

    const project = await addProjectToDb(db, USER_ID, {
      kitId,
      name: 'My Build',
      description: 'desc',
    })

    expect(project.userId).toBe(USER_ID)
    expect(project.kitId).toBe(kitId)
    expect(project.name).toBe('My Build')
    expect(project.description).toBe('desc')
    expect(project.status).toBe('planning')
    expect(project.startedAt).toBeNull()
    expect(project.completedAt).toBeNull()
    expect(project.id).toMatch(/^[0-9a-f-]{36}$/)

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(1)
    expect(events[0]?.delta).toBe(-1)
    expect(events[0]?.reason).toBe('project')
    expect(events[0]?.projectId).toBe(project.id)
    expect(events[0]?.userId).toBe(USER_ID)
  })

  it('在庫 2 → project 作成 → stock=1、累積で更に project 作成 → stock=0', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 2 }).run()

    await addProjectToDb(db, USER_ID, { kitId, name: 'P1' })
    await addProjectToDb(db, USER_ID, { kitId, name: 'P2' })

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(2)
    expect(events.every((evt) => evt.delta === -1 && evt.reason === 'project')).toBe(true)

    const projectsRows = db.select().from(projects).all()
    expect(projectsRows).toHaveLength(2)
  })

  it('在庫 0 → CHECK 違反 throw + batch rollback (project 未作成・kit_event 未記録・stock=0 のまま)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 0 }).run()

    await expect(addProjectToDb(db, USER_ID, { kitId, name: 'P' })).rejects.toThrow(
      /在庫が不足しています/,
    )

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(0)

    const projectsRows = db.select().from(projects).all()
    expect(projectsRows).toHaveLength(0)
  })

  it('既存 stock 行なし → CHECK 違反 throw (INSERT 候補値 -1 が CHECK で reject、batch 全 rollback)', async () => {
    await expect(addProjectToDb(db, USER_ID, { kitId, name: 'P' })).rejects.toThrow(
      /在庫が不足しています/,
    )

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock).toBeUndefined()

    const projectsRows = db.select().from(projects).all()
    expect(projectsRows).toHaveLength(0)
  })

  it('別 user の kit_stocks は独立 (composite PK userId+kitId)', async () => {
    const otherUser = 'user-test-2'
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 1 }).run()
    db.insert(kitStocks).values({ userId: otherUser, kitId, count: 5 }).run()

    await addProjectToDb(db, USER_ID, { kitId, name: 'P' })

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
    expect(myStock?.count).toBe(0)
    expect(otherStock?.count).toBe(5)
  })

  it('description 省略時 null で記録 (optional field の正しい defaulting)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 1 }).run()

    const project = await addProjectToDb(db, USER_ID, { kitId, name: 'No Desc' })

    expect(project.description).toBeNull()
    const stored = db.select().from(projects).where(eq(projects.id, project.id)).get()
    expect(stored?.description).toBeNull()
  })
})
