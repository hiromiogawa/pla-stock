import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { paints } from '~/entities/paint/schema'
import { projects } from '~/entities/project/schema'

/**
 * project_paint_use: Project ↔ Paint master の M:N 中間テーブル。
 *
 * count 非影響 (paint stock は project と独立)。
 * 本 entity は cross-entity import (paint + project schema) を許容する唯一の場所。
 * dependency-cruiser に例外設定を追加して通す。
 */

export const projectPaintUse = sqliteTable(
  'project_paint_use',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id),
    paintId: text('paint_id')
      .notNull()
      .references(() => paints.id),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.paintId] }),
  }),
)

export type ProjectPaintUse = typeof projectPaintUse.$inferSelect
export type NewProjectPaintUse = typeof projectPaintUse.$inferInsert
