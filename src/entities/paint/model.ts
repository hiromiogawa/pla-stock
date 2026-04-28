/**
 * 塗料ドメインモデル。
 *
 * Phase A-2 ではモック層と組み合わせて使う。Phase C で Drizzle の sqliteTable と
 * 整合させる。マスターは admin curated only（Phase E でシード投入前提）。
 *
 * 在庫モデル: per-unit → count + event log (ledger) pattern に統一 (2026-04-27)。
 * PaintStatus 廃止。PaintStock は (userId, paintId) composite key で 1 行、count で管理。
 * Project ↔ Paint は M:N で count 変化させない (project_paint_use)。
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

export type ColorFamily = (typeof COLOR_FAMILY_VALUES)[number]

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

export type FinishType = (typeof FINISH_TYPE_VALUES)[number]

/** Admin curated 公開カタログ master の塗料定義 */
export interface Paint {
  id: string
  brand: string
  code: string
  name: string
  colorFamily: ColorFamily | null
  finishType: FinishType | null
  swatchUrl: string | null
}

/**
 * ユーザーの塗料在庫 (count cache)。
 * unique key = (userId, paintId)。synthetic id なし。
 * count は events の SUM(delta) から再計算可能。count = 0 でも行は残す。
 */
export interface PaintStock {
  userId: string
  paintId: string
  /** 在庫数 >= 0 */
  count: number
}

/**
 * 塗料入出庫の理由。
 * 注: 'project' はない — project_paint_use は count に影響しない M:N 関係。
 */
export type PaintEventReason = 'purchase' | 'gift' | 'sell' | 'discard' | 'lost' | 'other'

/**
 * 塗料入出庫イベント (audit ledger)。
 * delta > 0: 入庫、delta < 0: 出庫。delta = 0 は禁止。
 */
export interface PaintEvent {
  id: string
  userId: string
  paintId: string
  /** 非ゼロ。+N: 入庫、-N: 出庫 */
  delta: number
  reason: PaintEventReason
  /** reason='purchase' 時に設定 */
  purchasedAt: string | null
  /** reason='purchase' 時に設定 (円) */
  priceYen: number | null
  /** reason='purchase' 時に設定 */
  purchaseLocation: string | null
  note: string | null
  createdAt: string
}
