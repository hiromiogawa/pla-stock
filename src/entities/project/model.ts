/**
 * プロジェクト (製作プロジェクト) ドメインモデル。
 *
 * Phase A-2 ではモック層と組み合わせて使う。Phase C で Drizzle の sqliteTable と
 * 整合させる。1 プロジェクト = 1 キット master (kitId 直リンク)、塗料は M:N。
 *
 * 変更 (2026-04-27): kit_stock_id 廃止 → kitId (master FK) 必須。
 * project 作成時に kitEvent(delta=-1, reason='project') が発火して在庫を減らす。
 * project_paints → project_paint_use rename、paint_id は paint master 直リンク (count 変化なし)。
 */
export type ProjectStatus = 'planning' | 'building' | 'completed' | 'abandoned'

export interface Project {
  id: string
  userId: string
  /** 紐付くキット master の ID (必須)。project 作成時にcount -1 trigger。 */
  kitId: string
  name: string
  description: string | null
  status: ProjectStatus
  startedAt: string | null
  completedAt: string | null
}

/** プロジェクトの工程・完成写真 */
export interface ProjectPhoto {
  id: string
  projectId: string
  url: string
  r2Key: string | null
  caption: string | null
  takenAt: string | null
}
