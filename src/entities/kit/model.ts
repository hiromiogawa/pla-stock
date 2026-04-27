/**
 * キット (Gunpla / scale model) ドメインモデル。
 *
 * Phase A-2 ではモック層と組み合わせて使う。Phase C で Drizzle の sqliteTable と
 * 整合させる。マスターは admin curated only（Phase E でシード投入前提）。
 *
 * 在庫モデル: per-unit → count + event log (ledger) pattern に統一 (2026-04-27)。
 * KitStock は (userId, kitId) composite key で 1 行、count で在庫数を管理。
 * KitEvent が全入出庫の audit ledger を担う。
 */
export type Grade = 'HG' | 'RG' | 'EG' | 'MG' | 'PG' | 'other'

export type Scale = '1/144' | '1/100' | '1/60' | '1/48' | 'other'

/** Admin curated 公開カタログ master のキット定義 */
export interface Kit {
  id: string
  name: string
  grade: Grade
  scale: Scale
  maker: string
  retailPriceYen: number | null
  janCode: string | null
  boxArtUrl: string | null
}

/**
 * ユーザーのキット在庫 (count cache)。
 * unique key = (userId, kitId)。synthetic id なし。
 * count は events の SUM(delta) から再計算可能。count = 0 でも行は残す。
 */
export interface KitStock {
  userId: string
  kitId: string
  /** 在庫数 >= 0。events の SUM(delta) と整合する。 */
  count: number
}

/** キット入出庫の理由 */
export type KitEventReason =
  | 'purchase'
  | 'project'
  | 'gift'
  | 'sell'
  | 'discard'
  | 'other'

/**
 * キット入出庫イベント (audit ledger)。
 * delta > 0: 入庫 (購入・贈り物など)
 * delta < 0: 出庫 (プロジェクト消費・売却・廃棄など)
 * delta = 0 は禁止。
 */
export interface KitEvent {
  id: string
  userId: string
  kitId: string
  /** 非ゼロ。+N: 入庫、-N: 出庫 */
  delta: number
  reason: KitEventReason
  /** reason='project' 時に設定 */
  projectId: string | null
  /** reason='purchase' 時に設定 */
  purchasedAt: string | null
  /** reason='purchase' 時に設定 (円) */
  priceYen: number | null
  /** reason='purchase' 時に設定 */
  purchaseLocation: string | null
  note: string | null
  createdAt: string
}
