/**
 * プロジェクト (製作プロジェクト) ドメインモデル。
 *
 * Phase A-2 ではモック層と組み合わせて使う。Phase C で Drizzle の sqliteTable と
 * 整合させる。1 プロジェクト = 1 キット (kit_stock_id 1:1)、塗料は M:N。
 */
export type ProjectStatus = 'planning' | 'building' | 'completed' | 'abandoned'

export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
  status: ProjectStatus
  startedAt: string | null
  completedAt: string | null
  /** 紐付くキット (planning 段階では未決定もあるため nullable) */
  kitStockId: string | null
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
