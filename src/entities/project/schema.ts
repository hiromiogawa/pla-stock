import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * プロジェクト (製作プロジェクト) ドメインの Drizzle schema (SSoT)。
 *
 * テーブル: projects / project_photos
 * 注: projects.kit_id は cross-entity 弱結合のため `.references()` を付けない。
 *     project_paint_use は M:N 中間テーブルで `entities/projectPaintUse/` に独立。
 */

export const PROJECT_STATUS_VALUES = ['planning', 'building', 'completed', 'abandoned'] as const

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  /** kit master への弱結合。`.references()` は付けない (FSD 同層依存回避)。 */
  kitId: text('kit_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: PROJECT_STATUS_VALUES }).notNull(),
  /** calendar date 'YYYY-MM-DD'。 */
  startedAt: text('started_at'),
  /** calendar date 'YYYY-MM-DD'。 */
  completedAt: text('completed_at'),
})

export const projectPhotos = sqliteTable('project_photos', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  url: text('url').notNull(),
  r2Key: text('r2_key'),
  caption: text('caption'),
  /** calendar date 'YYYY-MM-DD'。 */
  takenAt: text('taken_at'),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type ProjectPhoto = typeof projectPhotos.$inferSelect
export type NewProjectPhoto = typeof projectPhotos.$inferInsert
export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number]
