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
 * 塗料入出庫の理由 (SSoT)。
 *
 * ADR-0005 (Domain enum 集約規約) に従い tuple + 型派生 + labels の 3 点セットで集約。
 * tuple は型派生と label Record の網羅性チェックに使うため module-private。
 * 外部利用が必要になったら export する。
 * 注: 'project' はない — project_paint_use は count に影響しない M:N 関係。
 */
const PAINT_EVENT_REASONS = ['purchase', 'gift', 'sell', 'discard', 'lost', 'other'] as const

/** 塗料入出庫の理由 */
export type PaintEventReason = (typeof PAINT_EVENT_REASONS)[number]

/**
 * PaintEventReason に対する日本語 label (release dialog 表記基準)。
 *
 * 注: discard は塗料の文脈で「使い切って廃棄」を含意するため `廃棄（使い切り）` とする。
 * 履歴 view (PaintDetailFields) 側は別 label record を持っており、表記揺れが残る。
 * 統一は別 Issue で扱う。
 */
export const PAINT_EVENT_REASON_LABELS = {
  purchase: '購入',
  gift: '譲渡',
  sell: '売却',
  discard: '廃棄（使い切り）',
  lost: '紛失',
  other: 'その他',
} as const satisfies Record<PaintEventReason, string>

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
