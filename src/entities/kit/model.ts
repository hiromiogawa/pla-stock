/**
 * キット (Gunpla / scale model) ドメインモデル。
 *
 * Phase A-2 ではモック層と組み合わせて使う。Phase C で Drizzle の sqliteTable と
 * 整合させる。Kit は public master entry / private user entry の両方を表現する。
 */
export type Grade = 'HG' | 'RG' | 'EG' | 'MG' | 'PG' | 'other'

export type Scale = '1/144' | '1/100' | '1/60' | '1/48' | 'other'

export type Visibility = 'public' | 'private'

export type AssemblyStatus = 'unbuilt' | 'building' | 'completed'

/** Public カタログ master または private user 作成のキット定義 */
export interface Kit {
  id: string
  name: string
  grade: Grade
  scale: Scale
  maker: string
  retailPriceYen: number | null
  janCode: string | null
  boxArtUrl: string | null
  visibility: Visibility
  /** private 時の作成者 (users.id)。public は null */
  ownerId: string | null
}

/** ユーザー所有のキット在庫 */
export interface KitStock {
  id: string
  userId: string
  kitId: string
  purchasedAt: string | null
  purchasePriceYen: number | null
  purchaseLocation: string | null
  assemblyStatus: AssemblyStatus
  photoUrl: string | null
  remark: string | null
}
