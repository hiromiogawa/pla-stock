import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, primaryKey, index, check } from 'drizzle-orm/sqlite-core'

/**
 * キット (Gunpla) ドメインの Drizzle schema (SSoT)。
 *
 * テーブル: kits (master) / kit_stocks (count cache) / kit_events (audit ledger)
 * 在庫モデル: count + event ledger pattern。
 *
 * 派生型は本ファイル末尾で `$inferSelect` から export。enum values も SSoT として
 * ここで `as const` 配列宣言、列定義の `enum:` と型派生に同時利用。
 */

export const GRADE_VALUES = ['HG', 'RG', 'EG', 'MG', 'PG', 'other'] as const
export const SCALE_VALUES = ['1/144', '1/100', '1/60', '1/48', 'other'] as const
export const KIT_EVENT_REASONS = [
  'purchase',
  'project',
  'gift',
  'sell',
  'discard',
  'other',
] as const

export const kits = sqliteTable('kits', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  grade: text('grade', { enum: GRADE_VALUES }).notNull(),
  scale: text('scale', { enum: SCALE_VALUES }).notNull(),
  retailPriceYen: integer('retail_price_yen'),
  boxArtUrl: text('box_art_url'),
})

export const kitStocks = sqliteTable(
  'kit_stocks',
  {
    userId: text('user_id').notNull(),
    kitId: text('kit_id')
      .notNull()
      .references(() => kits.id),
    count: integer('count').notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.kitId] }),
    countNonNegative: check('kit_stocks_count_non_negative', sql`${table.count} >= 0`),
  }),
)

export const kitEvents = sqliteTable(
  'kit_events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    kitId: text('kit_id')
      .notNull()
      .references(() => kits.id),
    delta: integer('delta').notNull(),
    reason: text('reason', { enum: KIT_EVENT_REASONS }).notNull(),
    /** project への弱結合 (cross-entity)。`.references()` は付けない (FSD 同層依存回避)。 */
    projectId: text('project_id'),
    /** calendar date 'YYYY-MM-DD'。日付ラベルのため TEXT 維持。 */
    purchasedAt: text('purchased_at'),
    priceYen: integer('price_yen'),
    purchaseLocation: text('purchase_location'),
    note: text('note'),
    /** instant timestamp (epoch ms) → boundary は Date。 */
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => ({
    userCreatedIdx: index('kit_events_user_created_idx').on(table.userId, table.createdAt),
  }),
)

export type Kit = typeof kits.$inferSelect
export type NewKit = typeof kits.$inferInsert
export type KitStock = typeof kitStocks.$inferSelect
export type NewKitStock = typeof kitStocks.$inferInsert
export type KitEvent = typeof kitEvents.$inferSelect
export type NewKitEvent = typeof kitEvents.$inferInsert
export type Grade = (typeof GRADE_VALUES)[number]
export type Scale = (typeof SCALE_VALUES)[number]
export type KitEventReason = (typeof KIT_EVENT_REASONS)[number]
