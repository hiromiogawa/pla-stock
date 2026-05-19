import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { env } from 'cloudflare:workers'
import { and, eq } from 'drizzle-orm'
import { createDb } from '~/shared/lib/db/client'
import { projects, projectPhotos } from '../schema'
import { projectPaintUse } from '~/entities/projectPaintUse/schema'
import { projectIdInput } from './schemas'

/**
 * project ドメインの read query (Drizzle + D1 server fn)。
 *
 * 配置規約 (ADR-0008): read query は entities/{domain}/api/queries.ts、mutation は features/。
 *
 * - project は全テーブル per-user (master なし) → 全 fn で handler 内 auth() 必須
 * - 子テーブル (project_paint_use / project_photos) は userId 列を持たないため
 *   projects を INNER JOIN し projects.userId = <auth userId> で所有検証 (IDOR 防止)
 * - userId は client 入力でなく auth() 由来のみ (client は { projectId } のみ送れる)
 * - mock の挙動を保つため orderBy は付けない (behavior-preserving swap)
 */

export const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  const db = createDb(env.DB)
  return db.select().from(projects).where(eq(projects.userId, userId))
})

export const getProject = createServerFn({ method: 'GET' })
  .inputValidator(projectIdInput)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
      .limit(1)
    return rows[0] ?? null
  })

export const getProjectPaintUses = createServerFn({ method: 'GET' })
  .inputValidator(projectIdInput)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return db
      .select({
        projectId: projectPaintUse.projectId,
        paintId: projectPaintUse.paintId,
        createdAt: projectPaintUse.createdAt,
      })
      .from(projectPaintUse)
      .innerJoin(projects, eq(projectPaintUse.projectId, projects.id))
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
  })

export const getProjectPaintIds = createServerFn({ method: 'GET' })
  .inputValidator(projectIdInput)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    const rows = await db
      .select({ paintId: projectPaintUse.paintId })
      .from(projectPaintUse)
      .innerJoin(projects, eq(projectPaintUse.projectId, projects.id))
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
    return rows.map((row) => row.paintId)
  })

export const getProjectPhotos = createServerFn({ method: 'GET' })
  .inputValidator(projectIdInput)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
    const db = createDb(env.DB)
    return db
      .select({
        id: projectPhotos.id,
        projectId: projectPhotos.projectId,
        url: projectPhotos.url,
        r2Key: projectPhotos.r2Key,
        caption: projectPhotos.caption,
        takenAt: projectPhotos.takenAt,
      })
      .from(projectPhotos)
      .innerJoin(projects, eq(projectPhotos.projectId, projects.id))
      .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))
  })
