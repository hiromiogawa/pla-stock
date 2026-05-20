import type { Project, ProjectPhoto } from '../../model'
import type { ProjectPaintUse } from '~/entities/projectPaintUse'

/**
 * モック層: project / project_paint_use / project_photos の **seed 用** in-memory データと
 * **photo のみの CRUD アクセサ** (Phase C 移行期の残置)。
 *
 * Phase C 移行状況:
 * - project mutation (add/update/delete) と project_paint_use add/remove は
 *   `features/project-*` の Drizzle server fn に移行済み (#116)
 * - kit_events 連鎖 (addProject -1 / deleteProject planning 戻し +1) も server fn 内 batch
 * - photo (`addProjectPhoto` / `deleteProjectPhoto`) は **Phase D (#6, R2 統合)** で
 *   一緒に server fn 化するため当面 mock のまま残置
 *
 * mock 配列 (mockProjects / mockProjectPaintUses / mockProjectPhotos) は
 * `src/shared/lib/db/seed.ts` で D1 への初期投入元として利用される (master の SSoT)。
 */

const MOCK_USER_ID = 'mock-user-1'

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    userId: MOCK_USER_ID,
    kitId: 'kit-3', // Sazabi Ver.Ka (旧 kit-stock-3 → kit-3 に変換)
    name: 'Sazabi Ver.Ka 塗装計画',
    description: 'シャア専用カラーをガイア赤系で塗装、つや消しで仕上げる',
    status: 'completed',
    startedAt: '2026-01-05',
    completedAt: '2026-03-15',
  },
  {
    id: 'project-2',
    userId: MOCK_USER_ID,
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
export const mockProjectPaintUses: ProjectPaintUse[] = [
  // project-1 (Sazabi) で使った塗料
  { projectId: 'project-1', paintId: 'paint-5', createdAt: new Date('2026-01-05T10:00:00Z') },
  { projectId: 'project-1', paintId: 'paint-2', createdAt: new Date('2026-01-05T10:01:00Z') },
  { projectId: 'project-1', paintId: 'paint-4', createdAt: new Date('2026-01-05T10:02:00Z') },
  // project-2 (シャアザク) で使ってる塗料
  { projectId: 'project-2', paintId: 'paint-8', createdAt: new Date('2026-03-20T10:00:00Z') },
  { projectId: 'project-2', paintId: 'paint-1', createdAt: new Date('2026-03-20T10:01:00Z') },
]

export const mockProjectPhotos: ProjectPhoto[] = [
  {
    id: 'project-photo-1',
    projectId: 'project-1',
    url: 'https://example.com/photos/sazabi-wip-1.webp',
    r2Key: 'mock-user-1/2026/02/sazabi-wip-1.webp',
    caption: 'サフ吹き完了',
    takenAt: '2026-02-10',
  },
  {
    id: 'project-photo-2',
    projectId: 'project-1',
    url: 'https://example.com/photos/sazabi-finished.webp',
    r2Key: 'mock-user-1/2026/03/sazabi-finished.webp',
    caption: '完成',
    takenAt: '2026-03-15',
  },
]

// === Photo mutations (Phase D で server fn 化予定、当面 mock 残置) ===

let projectPhotoIdCounter = mockProjectPhotos.length + 1

export async function addProjectPhoto(input: {
  projectId: string
  url: string
  r2Key?: string | null
  caption?: string | null
  takenAt?: string | null
}): Promise<ProjectPhoto> {
  const newPhoto: ProjectPhoto = {
    id: `project-photo-${projectPhotoIdCounter++}`,
    projectId: input.projectId,
    url: input.url,
    r2Key: input.r2Key ?? null,
    caption: input.caption ?? null,
    takenAt: input.takenAt ?? null,
  }
  mockProjectPhotos.push(newPhoto)
  return newPhoto
}

export async function deleteProjectPhoto(input: { photoId: string }): Promise<boolean> {
  const idx = mockProjectPhotos.findIndex((ph) => ph.id === input.photoId)
  if (idx === -1) return false
  mockProjectPhotos.splice(idx, 1)
  return true
}
