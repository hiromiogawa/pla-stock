/**
 * キット (Gunpla / scale model) ドメインの UI labels と
 * schema 由来 type/enum の re-export。
 *
 * SSoT は `./schema` (Drizzle table)。本ファイルは UI 表示用 labels のみを所有し、
 * 型は schema から re-export で公開する。
 *
 * NOTE: `New*` 型 / `*_VALUES` 配列は server fn / form で使い始める PR で本ファイルか
 * `./schema` から追加 export する。今は consumer がないため knip strict が落ちる。
 */

import type { KitEventReason } from './schema'

export type { Kit, KitStock, KitEvent, KitEventReason, Grade, Scale } from './schema'

/** KitEventReason に対する日本語 label。 */
export const KIT_EVENT_REASON_LABELS = {
  purchase: '購入',
  project: 'プロジェクト',
  gift: '譲渡',
  sell: '売却',
  discard: '廃棄',
  other: 'その他',
} as const satisfies Record<KitEventReason, string>
