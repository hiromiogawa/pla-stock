import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { projectPhotos, projects } from '~/entities/project/schema'
import { createTestDb } from '~/test-utils/db'
import { createTestProject } from '~/test-utils/factories/project'
import { deleteProjectPhotoToDb } from './deleteProjectPhotoToDb'

describe('deleteProjectPhotoToDb', () => {
  const USER_ID = 'user-test-1'
  let db: BetterSQLite3Database
  let projectId: string

  beforeEach(() => {
    db = createTestDb()
    const project = createTestProject({ userId: USER_ID })
    projectId = project.id
    db.insert(projects).values(project).run()
  })

  function insertPhoto(opts: { id?: string; r2Key?: string | null } = {}): string {
    const id = opts.id ?? `photo-${crypto.randomUUID()}`
    db.insert(projectPhotos)
      .values({
        id,
        projectId,
        url: `/photos/${id}`,
        r2Key: opts.r2Key === undefined ? `key-${id}` : opts.r2Key,
        caption: null,
        takenAt: null,
      })
      .run()
    return id
  }

  it('自分の project の photo (r2Key あり) → { deleted: true, r2Key } 返却、photo 行削除', async () => {
    const photoId = insertPhoto({ r2Key: 'r2/key/abc.webp' })

    const result = await deleteProjectPhotoToDb(db, USER_ID, { photoId })

    expect(result.deleted).toBe(true)
    expect(result.r2Key).toBe('r2/key/abc.webp')

    const stored = db.select().from(projectPhotos).where(eq(projectPhotos.id, photoId)).get()
    expect(stored).toBeUndefined()
  })

  it('自分の project の photo (r2Key null = 古い行) → { deleted: true, r2Key: null }', async () => {
    const photoId = insertPhoto({ r2Key: null })

    const result = await deleteProjectPhotoToDb(db, USER_ID, { photoId })

    expect(result.deleted).toBe(true)
    expect(result.r2Key).toBeNull()
  })

  it('他人の project の photo → { deleted: false, r2Key: null }、photo 残存 (IDOR 防御)', async () => {
    const otherProject = createTestProject({ userId: 'user-test-2' })
    db.insert(projects).values(otherProject).run()
    const photoId = `photo-${crypto.randomUUID()}`
    db.insert(projectPhotos)
      .values({
        id: photoId,
        projectId: otherProject.id,
        url: '/photos/x',
        r2Key: 'x',
        caption: null,
        takenAt: null,
      })
      .run()

    const result = await deleteProjectPhotoToDb(db, USER_ID, { photoId })

    expect(result.deleted).toBe(false)
    expect(result.r2Key).toBeNull()

    const stored = db.select().from(projectPhotos).where(eq(projectPhotos.id, photoId)).get()
    expect(stored).not.toBeUndefined()
  })

  it('存在しない photoId → { deleted: false, r2Key: null }', async () => {
    const result = await deleteProjectPhotoToDb(db, USER_ID, { photoId: 'photo-ghost' })

    expect(result.deleted).toBe(false)
    expect(result.r2Key).toBeNull()
  })

  it('複数 photo がある project、指定 photo だけ削除、他は残存', async () => {
    const keepId = insertPhoto({ r2Key: 'keep' })
    const dropId = insertPhoto({ r2Key: 'drop' })

    const result = await deleteProjectPhotoToDb(db, USER_ID, { photoId: dropId })

    expect(result.deleted).toBe(true)
    expect(result.r2Key).toBe('drop')

    const remaining = db
      .select()
      .from(projectPhotos)
      .where(eq(projectPhotos.projectId, projectId))
      .all()
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.id).toBe(keepId)
  })
})
