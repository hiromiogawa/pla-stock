import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ProjectPhoto } from '~/entities/project'
import { projectPhotos, projects } from '~/entities/project/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestProject } from '~/test-utils/factories/project'
import { addProjectPhotoToDb } from './addProjectPhotoToDb'

describe('addProjectPhotoToDb', () => {
  const USER_ID = 'user-test-1'
  let db: BetterSQLite3Database
  let projectId: string

  beforeEach(() => {
    db = createTestDb()
    const project = createTestProject({ userId: USER_ID })
    projectId = project.id
    db.insert(projects).values(project).run()
  })

  function makePhoto(overrides: Partial<ProjectPhoto> = {}): ProjectPhoto {
    return {
      id: `photo-${crypto.randomUUID()}`,
      projectId,
      url: '/photos/u/2026/05/abc.webp',
      r2Key: 'u/2026/05/abc.webp',
      caption: null,
      takenAt: null,
      ...overrides,
    }
  }

  it('自分の project + photo → 行 INSERT、返り値は入力 photo そのまま', async () => {
    const photo = makePhoto({ caption: 'hero', takenAt: '2026-05-24' })

    const result = await addProjectPhotoToDb(db, USER_ID, { projectId, photo })

    expect(result).toBe(photo)

    const stored = db.select().from(projectPhotos).where(eq(projectPhotos.id, photo.id)).get()
    expect(stored?.url).toBe(photo.url)
    expect(stored?.r2Key).toBe(photo.r2Key)
    expect(stored?.caption).toBe('hero')
    expect(stored?.takenAt).toBe('2026-05-24')
  })

  it('他人の project への INSERT は throw、photo 行未作成 (IDOR 防御)', async () => {
    const photo = makePhoto()

    await expect(addProjectPhotoToDb(db, 'user-test-2', { projectId, photo })).rejects.toThrow(
      /対象のプロジェクトが見つかりません/,
    )

    const stored = db.select().from(projectPhotos).all()
    expect(stored).toHaveLength(0)
  })

  it('存在しない projectId → throw (not found / forbidden を区別しない)', async () => {
    const photo = makePhoto({ projectId: 'project-ghost' })

    await expect(
      addProjectPhotoToDb(db, USER_ID, { projectId: 'project-ghost', photo }),
    ).rejects.toThrow(/対象のプロジェクトが見つかりません/)
  })

  it('caption / takenAt 省略 → null で保存', async () => {
    const photo = makePhoto({ caption: null, takenAt: null })

    await addProjectPhotoToDb(db, USER_ID, { projectId, photo })

    const stored = db.select().from(projectPhotos).where(eq(projectPhotos.id, photo.id)).get()
    expect(stored?.caption).toBeNull()
    expect(stored?.takenAt).toBeNull()
  })

  it('r2Key null の photo も INSERT 可能 (schema 上 nullable、旧データ互換)', async () => {
    const photo = makePhoto({ r2Key: null, url: '/external/url' })

    await addProjectPhotoToDb(db, USER_ID, { projectId, photo })

    const stored = db.select().from(projectPhotos).where(eq(projectPhotos.id, photo.id)).get()
    expect(stored?.r2Key).toBeNull()
    expect(stored?.url).toBe('/external/url')
  })

  it('複数 photo を 1 project に追加可能 (PK は photo.id)', async () => {
    const photo1 = makePhoto()
    const photo2 = makePhoto({ r2Key: 'other-key' })

    await addProjectPhotoToDb(db, USER_ID, { projectId, photo: photo1 })
    await addProjectPhotoToDb(db, USER_ID, { projectId, photo: photo2 })

    const stored = db
      .select()
      .from(projectPhotos)
      .where(eq(projectPhotos.projectId, projectId))
      .all()
    expect(stored).toHaveLength(2)
  })
})
