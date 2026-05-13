/**
 * プロジェクトドメインの UI labels と schema 由来 type/enum の re-export。
 *
 * SSoT は `./schema` (Drizzle table)。
 *
 * NOTE: `New*` 型 / `*_VALUES` 配列は server fn / form で使い始める PR で追加する。
 */

export type { Project, ProjectPhoto, ProjectStatus } from './schema'

/** ProjectStatus に対する日本語 label。 */
import type { ProjectStatus } from './schema'

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}
