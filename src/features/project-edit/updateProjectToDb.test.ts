import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { projects } from '~/entities/project/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestProject } from '~/test-utils/factories/project'
import { updateProjectToDb } from './updateProjectToDb'

describe('updateProjectToDb', () => {
  const USER_ID = 'user-test-1'
  let db: BetterSQLite3Database
  let projectId: string

  beforeEach(() => {
    db = createTestDb()
    const project = createTestProject({ userId: USER_ID, name: 'Original' })
    projectId = project.id
    db.insert(projects).values(project).run()
  })

  it('自分の project に name を patch → 反映 + 更新行を返す', async () => {
    const updated = await updateProjectToDb(db, USER_ID, {
      projectId,
      patch: { name: 'Renamed' },
    })

    expect(updated).not.toBeNull()
    expect(updated?.name).toBe('Renamed')
    expect(updated?.id).toBe(projectId)

    const stored = db.select().from(projects).where(eq(projects.id, projectId)).get()
    expect(stored?.name).toBe('Renamed')
  })

  it('status / startedAt / completedAt を同時に patch → 全 field 反映', async () => {
    const updated = await updateProjectToDb(db, USER_ID, {
      projectId,
      patch: {
        status: 'completed',
        startedAt: '2026-01-01',
        completedAt: '2026-05-24',
      },
    })

    expect(updated?.status).toBe('completed')
    expect(updated?.startedAt).toBe('2026-01-01')
    expect(updated?.completedAt).toBe('2026-05-24')

    const stored = db.select().from(projects).where(eq(projects.id, projectId)).get()
    expect(stored?.status).toBe('completed')
    expect(stored?.startedAt).toBe('2026-01-01')
    expect(stored?.completedAt).toBe('2026-05-24')
  })

  it('description を null に patch → null 化', async () => {
    db.update(projects).set({ description: 'before' }).where(eq(projects.id, projectId)).run()

    const updated = await updateProjectToDb(db, USER_ID, {
      projectId,
      patch: { description: null },
    })

    expect(updated?.description).toBeNull()
  })

  it('他人の project の更新は null (IDOR 防御)、stored 値も不変', async () => {
    const updated = await updateProjectToDb(db, 'user-test-2', {
      projectId,
      patch: { name: 'Hacked' },
    })

    expect(updated).toBeNull()

    const stored = db.select().from(projects).where(eq(projects.id, projectId)).get()
    expect(stored?.name).toBe('Original')
  })

  it('存在しない id → null (not found / forbidden を区別しない仕様)', async () => {
    const updated = await updateProjectToDb(db, USER_ID, {
      projectId: 'project-nonexistent',
      patch: { name: 'ghost' },
    })

    expect(updated).toBeNull()
  })

  it('empty patch は drizzle が "No values to set" で reject (server fn 側で空 patch を validate するべき制約)', async () => {
    await expect(updateProjectToDb(db, USER_ID, { projectId, patch: {} })).rejects.toThrow(
      /No values to set/,
    )
  })
})
