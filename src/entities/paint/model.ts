/**
 * 塗料ドメインの UI labels と schema 由来 type/enum の re-export。
 *
 * SSoT は `./schema` (Drizzle table)。
 *
 * NOTE: `New*` 型 / `*_VALUES` 配列は server fn / form で使い始める PR で追加する。
 */

import type { PaintEventReason } from './schema'

export type {
  Paint,
  PaintStock,
  PaintEvent,
  PaintEventReason,
  ColorFamily,
  FinishType,
} from './schema'

export { COLOR_FAMILY_VALUES, FINISH_TYPE_VALUES } from './schema'

/**
 * PaintEventReason に対する日本語 label。
 *
 * 注: discard は塗料の文脈で「使い切って廃棄」を含意するため `廃棄（使い切り）`
 * とする (kit 側の `廃棄` とは区別)。
 */
export const PAINT_EVENT_REASON_LABELS = {
  purchase: '購入',
  gift: '譲渡',
  sell: '売却',
  discard: '廃棄（使い切り）',
  lost: '紛失',
  other: 'その他',
} as const satisfies Record<PaintEventReason, string>
