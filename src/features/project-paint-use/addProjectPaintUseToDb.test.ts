import { and, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { paints } from '~/entities/paint/schema'
import { projects } from '~/entities/project/schema'
import { projectPaintUse } from '~/entities/project-paint-use/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestPaint } from '~/test-utils/factories/paint'
import { createTestProject } from '~/test-utils/factories/project'
import { addProjectPaintUseToDb } from './addProjectPaintUseToDb'

describe('addProjectPaintUseToDb', () => {
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

  it('自分の project + 新規 link → 成功、link 行が PK (projectId, paintId) で 1 件作成', async () => {
    const link = await addProjectPaintUseToDb(db, USER_ID, { projectId, paintId })

    expect(link.projectId).toBe(projectId)
    expect(link.paintId).toBe(paintId)
    expect(link.createdAt).toBeInstanceOf(Date)

    const stored = db
      .select()
      .from(projectPaintUse)
      .where(and(eq(projectPaintUse.projectId, projectId), eq(projectPaintUse.paintId, paintId)))
      .all()
    expect(stored).toHaveLength(1)
  })

  it('重複 link は onConflictDoNothing で例外なく成功 (idempotent)、行は 1 件のまま', async () => {
    await addProjectPaintUseToDb(db, USER_ID, { projectId, paintId })
    const link2 = await addProjectPaintUseToDb(db, USER_ID, { projectId, paintId })

    expect(link2.projectId).toBe(projectId)

    const stored = db
      .select()
      .from(projectPaintUse)
      .where(and(eq(projectPaintUse.projectId, projectId), eq(projectPaintUse.paintId, paintId)))
      .all()
    expect(stored).toHaveLength(1)
  })

  it('他人の project への link は Forbidden throw、link 未作成 (IDOR 防御)', async () => {
    await expect(addProjectPaintUseToDb(db, 'user-test-2', { projectId, paintId })).rejects.toThrow(
      /Forbidden/,
    )

    const stored = db.select().from(projectPaintUse).all()
    expect(stored).toHaveLength(0)
  })

  it('存在しない projectId → Forbidden throw (not found / forbidden を区別しない)', async () => {
    await expect(
      addProjectPaintUseToDb(db, USER_ID, { projectId: 'project-ghost', paintId }),
    ).rejects.toThrow(/Forbidden/)
  })

  it('複数 paint を 1 project に link 可能 (composite PK は projectId+paintId)', async () => {
    const paintB = createTestPaint({ code: 'TEST-002' })
    db.insert(paints).values(paintB).run()

    await addProjectPaintUseToDb(db, USER_ID, { projectId, paintId })
    await addProjectPaintUseToDb(db, USER_ID, { projectId, paintId: paintB.id })

    const stored = db
      .select()
      .from(projectPaintUse)
      .where(eq(projectPaintUse.projectId, projectId))
      .all()
    expect(stored).toHaveLength(2)
  })
})
