import type { Project, ProjectPhoto } from '../../model'
import { addKitEvent } from '~/entities/kit/api/mock/kits'

/**
 * モック層: project / project_paint_use / project_photos の in-memory データと
 * CRUD アクセサ。
 *
 * 変更 (2026-04-27):
 * - Project.kitStockId 廃止 → Project.kitId (kit master 直リンク)
 * - project_paints → project_paint_use rename、paintStockId → paintId
 * - addProject が addKitEvent({delta:-1, reason:'project'}) を自動発火
 * - deleteProject で status='planning' なら count 戻す (+1 kit_event)
 *
 * Phase A-2 mock 仕様: アクセサ関数は input.userId を受け取るが内部で
 * MOCK_USER_ID に固定。Clerk が実 userId を渡しても demo データに到達できる。
 * Phase C で Drizzle + D1 に置換する時点で実 userId フィルタに切替予定。
 */

const MOCK_USER_ID = 'mock-user-1'

/** Project と Paint master の M:N 中間テーブル (count 変化なし) */
interface ProjectPaintUseLink {
  id: string
  projectId: string
  /** paint master の ID (旧: paintStockId から変更) */
  paintId: string
  createdAt: string
}

const projects: Project[] = [
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
const projectPaintUses: ProjectPaintUseLink[] = [
  // project-1 (Sazabi) で使った塗料
  { id: 'ppu-1', projectId: 'project-1', paintId: 'paint-5', createdAt: '2026-01-05T10:00:00Z' },
  { id: 'ppu-2', projectId: 'project-1', paintId: 'paint-2', createdAt: '2026-01-05T10:01:00Z' },
  { id: 'ppu-3', projectId: 'project-1', paintId: 'paint-4', createdAt: '2026-01-05T10:02:00Z' },
  // project-2 (シャアザク) で使ってる塗料
  { id: 'ppu-4', projectId: 'project-2', paintId: 'paint-8', createdAt: '2026-03-20T10:00:00Z' },
  { id: 'ppu-5', projectId: 'project-2', paintId: 'paint-1', createdAt: '2026-03-20T10:01:00Z' },
]

const projectPhotos: ProjectPhoto[] = [
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

// === Read accessors ===

export async function getProjects(_input: { userId: string }): Promise<Project[]> {
  return projects.filter((p) => p.userId === MOCK_USER_ID)
}

export async function getProject(input: {
  projectId: string
  userId: string
}): Promise<Project | null> {
  return projects.find((p) => p.id === input.projectId && p.userId === MOCK_USER_ID) ?? null
}

/** project に紐付く project_paint_use 一覧 */
export async function getProjectPaintUses(input: {
  projectId: string
}): Promise<ProjectPaintUseLink[]> {
  return projectPaintUses.filter((link) => link.projectId === input.projectId)
}

/** project に紐付く paint_id 一覧 (旧 getProjectPaintStockIds の後継) */
export async function getProjectPaintIds(input: { projectId: string }): Promise<string[]> {
  return projectPaintUses
    .filter((link) => link.projectId === input.projectId)
    .map((link) => link.paintId)
}

export async function getProjectPhotos(input: { projectId: string }): Promise<ProjectPhoto[]> {
  return projectPhotos.filter((ph) => ph.projectId === input.projectId)
}

// === Mutations ===

let projectIdCounter = projects.length + 1
let projectPaintUseIdCounter = projectPaintUses.length + 1
let projectPhotoIdCounter = projectPhotos.length + 1

/**
 * プロジェクトを作成する。
 *
 * 前提: getKitStock(userId, kitId).count >= 1 をアプリ層で確認すること。
 * 内部で addKitEvent({delta: -1, reason: 'project', projectId}) を発火して
 * kit_stock.count を 1 減らす。
 * status は 'planning' で初期化。
 */
export async function addProject(input: {
  userId: string
  kitId: string
  name: string
  description?: string | null
}): Promise<Project> {
  const newProject: Project = {
    id: `project-${projectIdCounter++}`,
    userId: MOCK_USER_ID,
    kitId: input.kitId,
    name: input.name,
    description: input.description ?? null,
    status: 'planning',
    startedAt: null,
    completedAt: null,
  }
  projects.push(newProject)

  // kit_event: count -1 (project 消費)
  await addKitEvent({
    userId: MOCK_USER_ID,
    kitId: input.kitId,
    delta: -1,
    reason: 'project',
    projectId: newProject.id,
  })

  return newProject
}

export async function updateProject(input: {
  projectId: string
  userId: string
  patch: Partial<Pick<Project, 'name' | 'description' | 'status' | 'startedAt' | 'completedAt'>>
}): Promise<Project | null> {
  const idx = projects.findIndex((p) => p.id === input.projectId && p.userId === MOCK_USER_ID)
  if (idx === -1) return null
  projects[idx] = { ...projects[idx], ...input.patch }
  return projects[idx]
}

/**
 * プロジェクトを削除する。
 *
 * - status='planning' なら addKitEvent({delta: +1, reason: 'project', note: 'returned'}) を発火。
 * - status='building' 以降は count を戻さない (既に開封済の前提)。
 * - 紐付く project_paint_use, project_photos は cascade 削除。
 */
export async function deleteProject(input: {
  projectId: string
  userId: string
}): Promise<boolean> {
  const idx = projects.findIndex((p) => p.id === input.projectId && p.userId === MOCK_USER_ID)
  if (idx === -1) return false

  const project = projects[idx]

  // planning 状態なら在庫を戻す
  if (project.status === 'planning') {
    await addKitEvent({
      userId: project.userId,
      kitId: project.kitId,
      delta: +1,
      reason: 'project',
      projectId: project.id,
      note: 'returned from cancelled planning',
    })
  }

  projects.splice(idx, 1)

  // cascade: project_paint_use
  for (let i = projectPaintUses.length - 1; i >= 0; i--) {
    if (projectPaintUses[i].projectId === input.projectId) {
      projectPaintUses.splice(i, 1)
    }
  }
  // cascade: project_photos
  for (let i = projectPhotos.length - 1; i >= 0; i--) {
    if (projectPhotos[i].projectId === input.projectId) {
      projectPhotos.splice(i, 1)
    }
  }

  return true
}

/**
 * project_paint_use を追加 (paint master 直リンク)。
 * count 変化なし。unique(projectId, paintId) をアプリ層で管理。
 */
export async function addProjectPaintUse(input: {
  projectId: string
  paintId: string
}): Promise<ProjectPaintUseLink> {
  const newLink: ProjectPaintUseLink = {
    id: `ppu-${projectPaintUseIdCounter++}`,
    projectId: input.projectId,
    paintId: input.paintId,
    createdAt: new Date().toISOString(),
  }
  projectPaintUses.push(newLink)
  return newLink
}

/** project_paint_use を削除。count 変化なし。 */
export async function removeProjectPaintUse(input: {
  projectId: string
  paintId: string
}): Promise<boolean> {
  const idx = projectPaintUses.findIndex(
    (link) => link.projectId === input.projectId && link.paintId === input.paintId,
  )
  if (idx === -1) return false
  projectPaintUses.splice(idx, 1)
  return true
}

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
  projectPhotos.push(newPhoto)
  return newPhoto
}

export async function deleteProjectPhoto(input: { photoId: string }): Promise<boolean> {
  const idx = projectPhotos.findIndex((ph) => ph.id === input.photoId)
  if (idx === -1) return false
  projectPhotos.splice(idx, 1)
  return true
}
