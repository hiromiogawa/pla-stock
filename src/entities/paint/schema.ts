import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'

/**
 * 塗料ドメインの Drizzle schema (SSoT)。
 *
 * テーブル: paints (master) / paint_stocks (count cache) / paint_events (audit ledger)
 * 注: paint_events.reason は 'project' を持たない (Project ↔ Paint は count 非影響)。
 */

export const COLOR_FAMILY_VALUES = [
  '赤',
  '青',
  '黄',
  '緑',
  '白',
  '黒',
  '銀',
  '金',
  '茶',
  '蛍光',
  'クリア',
  'other',
] as const

export const FINISH_TYPE_VALUES = [
  '光沢',
  '半光沢',
  'つや消し',
  'メタリック',
  'パール',
  'クリア',
  'プライマー',
  'ウェザリング',
] as const

export const PAINT_EVENT_REASONS = ['purchase', 'gift', 'sell', 'discard', 'lost', 'other'] as const

export const paints = sqliteTable('paints', {
  id: text('id').primaryKey(),
  brand: text('brand').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  colorFamily: text('color_family', { enum: COLOR_FAMILY_VALUES }),
  finishType: text('finish_type', { enum: FINISH_TYPE_VALUES }),
  swatchUrl: text('swatch_url'),
})

export const paintStocks = sqliteTable(
  'paint_stocks',
  {
    userId: text('user_id').notNull(),
    paintId: text('paint_id')
      .notNull()
      .references(() => paints.id),
    count: integer('count').notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.paintId] }),
  }),
)

export const paintEvents = sqliteTable(
  'paint_events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    paintId: text('paint_id')
      .notNull()
      .references(() => paints.id),
    delta: integer('delta').notNull(),
    reason: text('reason', { enum: PAINT_EVENT_REASONS }).notNull(),
    /** calendar date 'YYYY-MM-DD'。日付ラベルのため TEXT 維持。 */
    purchasedAt: text('purchased_at'),
    priceYen: integer('price_yen'),
    purchaseLocation: text('purchase_location'),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => ({
    userCreatedIdx: index('paint_events_user_created_idx').on(table.userId, table.createdAt),
  }),
)

export type Paint = typeof paints.$inferSelect
export type NewPaint = typeof paints.$inferInsert
export type PaintStock = typeof paintStocks.$inferSelect
export type NewPaintStock = typeof paintStocks.$inferInsert
export type PaintEvent = typeof paintEvents.$inferSelect
export type NewPaintEvent = typeof paintEvents.$inferInsert
export type ColorFamily = (typeof COLOR_FAMILY_VALUES)[number]
export type FinishType = (typeof FINISH_TYPE_VALUES)[number]
export type PaintEventReason = (typeof PAINT_EVENT_REASONS)[number]
