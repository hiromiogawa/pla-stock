/**
 * 塗料ドメインモデル。
 *
 * Phase A-2 ではモック層と組み合わせて使う。Phase C で Drizzle の sqliteTable と
 * 整合させる。Paint は public master entry / private user entry の両方を表現する。
 */
import type { Visibility } from '~/entities/kit'

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

export type PaintStatus = 'new' | 'in_use' | 'empty'

/** Public カタログ master または private user 作成の塗料定義 */
export interface Paint {
  id: string
  brand: string
  code: string
  name: string
  colorFamily: ColorFamily | null
  finishType: FinishType | null
  swatchUrl: string | null
  visibility: Visibility
  /** private 時の作成者 (users.id)。public は null */
  ownerId: string | null
}

/** ユーザー所有の塗料在庫 */
export interface PaintStock {
  id: string
  userId: string
  paintId: string
  purchasedAt: string | null
  purchasePriceYen: number | null
  status: PaintStatus
  remark: string | null
}
