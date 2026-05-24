import { and, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { kitEvents, kitStocks, kits } from '~/entities/kit/schema'
import { projectPhotos, projects } from '~/entities/project/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestKit } from '~/test-utils/factories/kit'
import { createTestProject } from '~/test-utils/factories/project'
import { deleteProjectToDb } from './deleteProjectToDb'

describe('deleteProjectToDb', () => {
  const USER_ID = 'user-test-1'
  let db: BetterSQLite3Database
  let kitId: string

  beforeEach(() => {
    db = createTestDb()
    const kit = createTestKit()
    kitId = kit.id
    db.insert(kits).values(kit).run()
  })

  it('自分の planning project + 在庫 0 → 削除成功、kit_stocks 行 upsert で count=1、kit_event reason=project delta=+1 が記録', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 0 }).run()
    const project = createTestProject({ userId: USER_ID, kitId, status: 'planning' })
    db.insert(projects).values(project).run()

    const result = await deleteProjectToDb(db, USER_ID, { projectId: project.id })

    expect(result).toBe(true)

    const remaining = db.select().from(projects).where(eq(projects.id, project.id)).get()
    expect(remaining).toBeUndefined()

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(1)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(1)
    expect(events[0]?.delta).toBe(1)
    expect(events[0]?.reason).toBe('project')
    expect(events[0]?.projectId).toBe(project.id)
    expect(events[0]?.note).toBe('returned from cancelled planning')
  })

  it('既存 stock 行なし + planning 削除 → 新規 stock 行 count=1 作成', async () => {
    const project = createTestProject({ userId: USER_ID, kitId, status: 'planning' })
    db.insert(projects).values(project).run()

    const result = await deleteProjectToDb(db, USER_ID, { projectId: project.id })

    expect(result).toBe(true)

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(1)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(1)
  })

  it('自分の building project → 削除成功、kit 在庫不変、kit_event 未記録 (戻し対象外)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 0 }).run()
    const project = createTestProject({ userId: USER_ID, kitId, status: 'building' })
    db.insert(projects).values(project).run()

    const result = await deleteProjectToDb(db, USER_ID, { projectId: project.id })

    expect(result).toBe(true)

    const remaining = db.select().from(projects).where(eq(projects.id, project.id)).get()
    expect(remaining).toBeUndefined()

    const stock = db.select().from(kitStocks).where(eq(kitStocks.kitId, kitId)).get()
    expect(stock?.count).toBe(0)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(0)
  })

  it('自分の completed project → 削除成功、kit 在庫不変、kit_event 未記録', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 0 }).run()
    const project = createTestProject({ userId: USER_ID, kitId, status: 'completed' })
    db.insert(projects).values(project).run()

    const result = await deleteProjectToDb(db, USER_ID, { projectId: project.id })

    expect(result).toBe(true)

    const events = db.select().from(kitEvents).where(eq(kitEvents.kitId, kitId)).all()
    expect(events).toHaveLength(0)
  })

  it('他人の planning project → false、project 残存、kit 在庫不変、kit_event 未記録 (IDOR 防御)', async () => {
    db.insert(kitStocks).values({ userId: 'user-test-2', kitId, count: 0 }).run()
    const project = createTestProject({
      userId: 'user-test-2',
      kitId,
      status: 'planning',
    })
    db.insert(projects).values(project).run()

    const result = await deleteProjectToDb(db, USER_ID, { projectId: project.id })

    expect(result).toBe(false)

    const remaining = db.select().from(projects).where(eq(projects.id, project.id)).get()
    expect(remaining).not.toBeUndefined()

    const otherStock = db
      .select()
      .from(kitStocks)
      .where(and(eq(kitStocks.userId, 'user-test-2'), eq(kitStocks.kitId, kitId)))
      .get()
    expect(otherStock?.count).toBe(0)

    const events = db.select().from(kitEvents).all()
    expect(events).toHaveLength(0)
  })

  it('存在しない id → false、副作用なし', async () => {
    const result = await deleteProjectToDb(db, USER_ID, { projectId: 'project-ghost' })

    expect(result).toBe(false)
    const events = db.select().from(kitEvents).all()
    expect(events).toHaveLength(0)
  })

  it('planning project + 関連 photo 行あり → photo 行も連動削除 (batch 内で明示 DELETE)', async () => {
    db.insert(kitStocks).values({ userId: USER_ID, kitId, count: 0 }).run()
    const project = createTestProject({ userId: USER_ID, kitId, status: 'planning' })
    db.insert(projects).values(project).run()
    db.insert(projectPhotos)
      .values({
        id: `photo-${crypto.randomUUID()}`,
        projectId: project.id,
        url: '/photos/x',
        r2Key: 'x',
        caption: null,
        takenAt: null,
      })
      .run()

    const result = await deleteProjectToDb(db, USER_ID, { projectId: project.id })

    expect(result).toBe(true)
    const photos = db
      .select()
      .from(projectPhotos)
      .where(eq(projectPhotos.projectId, project.id))
      .all()
    expect(photos).toHaveLength(0)
  })

  it('not-planning project + 関連 photo 行あり → photo 行も連動削除 (kit 戻しなし branch)', async () => {
    const project = createTestProject({ userId: USER_ID, kitId, status: 'completed' })
    db.insert(projects).values(project).run()
    db.insert(projectPhotos)
      .values({
        id: `photo-${crypto.randomUUID()}`,
        projectId: project.id,
        url: '/photos/x',
        r2Key: 'x',
        caption: null,
        takenAt: null,
      })
      .run()

    const result = await deleteProjectToDb(db, USER_ID, { projectId: project.id })

    expect(result).toBe(true)
    const photos = db
      .select()
      .from(projectPhotos)
      .where(eq(projectPhotos.projectId, project.id))
      .all()
    expect(photos).toHaveLength(0)
  })
})
