import { and, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { paints } from '~/entities/paint/schema'
import { projects } from '~/entities/project/schema'
import { projectPaintUse } from '~/entities/projectPaintUse/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestPaint } from '~/test-utils/factories/paint'
import { createTestProject } from '~/test-utils/factories/project'
import { removeProjectPaintUseToDb } from './removeProjectPaintUseToDb'

describe('removeProjectPaintUseToDb', () => {
  const USER_ID = 'user-test-1'
  let db: BetterSQLite3Database
  let projectId: string
  let paintId: string

  beforeEach(() => {
    db = createTestDb()
    const project = createTestProject({ userId: USER_ID })
    projectId = project.id
    db.insert(projects).values(project).run()
    const paint = createTestPaint()
    paintId = paint.id
    db.insert(paints).values(paint).run()
  })

  it('自分の project + 存在する link → true、link 行 0 件', async () => {
    db.insert(projectPaintUse).values({ projectId, paintId, createdAt: new Date() }).run()

    const removed = await removeProjectPaintUseToDb(db, USER_ID, { projectId, paintId })

    expect(removed).toBe(true)
    const stored = db
      .select()
      .from(projectPaintUse)
      .where(and(eq(projectPaintUse.projectId, projectId), eq(projectPaintUse.paintId, paintId)))
      .all()
    expect(stored).toHaveLength(0)
  })

  it('自分の project + 存在しない link → false (副作用なし)', async () => {
    const removed = await removeProjectPaintUseToDb(db, USER_ID, { projectId, paintId })

    expect(removed).toBe(false)
  })

  it('他人の project への remove → false、link 残存 (IDOR 防御)', async () => {
    db.insert(projectPaintUse).values({ projectId, paintId, createdAt: new Date() }).run()

    const removed = await removeProjectPaintUseToDb(db, 'user-test-2', { projectId, paintId })

    expect(removed).toBe(false)
    const stored = db
      .select()
      .from(projectPaintUse)
      .where(eq(projectPaintUse.projectId, projectId))
      .all()
    expect(stored).toHaveLength(1)
  })

  it('存在しない projectId → false', async () => {
    const removed = await removeProjectPaintUseToDb(db, USER_ID, {
      projectId: 'project-ghost',
      paintId,
    })

    expect(removed).toBe(false)
  })

  it('複数 link 存在、指定 paintId だけ削除、他 link 残存', async () => {
    const paintB = createTestPaint({ code: 'TEST-002' })
    db.insert(paints).values(paintB).run()
    db.insert(projectPaintUse).values({ projectId, paintId, createdAt: new Date() }).run()
    db.insert(projectPaintUse)
      .values({ projectId, paintId: paintB.id, createdAt: new Date() })
      .run()

    const removed = await removeProjectPaintUseToDb(db, USER_ID, { projectId, paintId })

    expect(removed).toBe(true)
    const stored = db
      .select()
      .from(projectPaintUse)
      .where(eq(projectPaintUse.projectId, projectId))
      .all()
    expect(stored).toHaveLength(1)
    expect(stored[0]?.paintId).toBe(paintB.id)
  })
})
