import type { Project } from '../../model'
import type { ProjectPaintUse } from '~/entities/projectPaintUse'

/**
 * seed 層: project / project_paint_use の初期投入用 in-memory データ。
 * `src/shared/lib/db/seed.ts` から D1 への truncate-then-insert で利用される
 * (dev seed、production runtime 非対象)。
 *
 * Phase C/D 移行状況:
 * - project mutation (add/update/delete) / project_paint_use add/remove /
 *   photo add/delete はすべて `features/project-*` の Drizzle server fn に移行済み
 *   (#116 / #135)。本ファイルに CRUD アクセサは残っていない
 * - test fixture とは別系統 (test は `src/test-utils/factories/project.ts` を使う、ADR-0016)
 */

const SEED_USER_ID = 'seed-user-1'

export const seedProjects: Project[] = [
  {
    id: 'project-1',
    userId: SEED_USER_ID,
    kitId: 'kit-3', // Sazabi Ver.Ka (旧 kit-stock-3 → kit-3 に変換)
    name: 'Sazabi Ver.Ka 塗装計画',
    description: 'シャア専用カラーをガイア赤系で塗装、つや消しで仕上げる',
    status: 'completed',
    startedAt: '2026-01-05',
    completedAt: '2026-03-15',
  },
  {
    id: 'project-2',
    userId: SEED_USER_ID,
    kitId: 'kit-2', // Char's Zaku II (旧 kit-stock-2 → kit-2 に変換)
    name: 'シャアザク 製作中',
    description: 'RG Char Zaku II をベースに少しディテールアップ',
    status: 'building',
    startedAt: '2026-03-20',
    completedAt: null,
  },
]

/**
 * project_paint_use: paint master 直リンク M:N。
 * 旧 paintStockId → paintId に変換:
 *   paint-stock-5 → paint-5 (キャラクターレッド)
 *   paint-stock-2 → paint-2 (ブラック)
 *   paint-stock-4 → paint-4 (スーパークリア)
 *   paint-stock-7 → paint-8 (ガイア フレームレッド)
 *   paint-stock-1 → paint-1 (ホワイト)
 */
export const seedProjectPaintUses: ProjectPaintUse[] = [
  // project-1 (Sazabi) で使った塗料
  { projectId: 'project-1', paintId: 'paint-5', createdAt: new Date('2026-01-05T10:00:00Z') },
  { projectId: 'project-1', paintId: 'paint-2', createdAt: new Date('2026-01-05T10:01:00Z') },
  { projectId: 'project-1', paintId: 'paint-4', createdAt: new Date('2026-01-05T10:02:00Z') },
  // project-2 (シャアザク) で使ってる塗料
  { projectId: 'project-2', paintId: 'paint-8', createdAt: new Date('2026-03-20T10:00:00Z') },
  { projectId: 'project-2', paintId: 'paint-1', createdAt: new Date('2026-03-20T10:01:00Z') },
]
