import type { Project, ProjectPhoto } from '~/entities/project'

/**
 * モック層: project / project_paints / project_photos の in-memory データと CRUD アクセサ。
 *
 * project_paints は entities に型が無いため (M:N junction) ここでローカル型を定義。
 * Phase C で Drizzle で実テーブル化する時に entities に昇格してもよい。
 */

const MOCK_USER_ID = 'mock-user-1'

/** Project と PaintStock の M:N 中間テーブル */
export interface ProjectPaintLink {
  id: string
  projectId: string
  paintStockId: string
}

const projects: Project[] = [
  {
    id: 'project-1',
    userId: MOCK_USER_ID,
    name: 'Sazabi Ver.Ka 塗装計画',
    description: 'シャア専用カラーをガイア赤系で塗装、つや消しで仕上げる',
    status: 'completed',
    startedAt: '2026-01-05',
    completedAt: '2026-03-15',
    kitStockId: 'kit-stock-3',
  },
  {
    id: 'project-2',
    userId: MOCK_USER_ID,
    name: 'シャアザク 製作中',
    description: 'RG Char Zaku II をベースに少しディテールアップ',
    status: 'building',
    startedAt: '2026-03-20',
    completedAt: null,
    kitStockId: 'kit-stock-2',
  },
]

const projectPaints: ProjectPaintLink[] = [
  // project-1 (Sazabi) で使った塗料
  { id: 'pp-1', projectId: 'project-1', paintStockId: 'paint-stock-5' }, // キャラクターレッド
  { id: 'pp-2', projectId: 'project-1', paintStockId: 'paint-stock-2' }, // ブラック
  { id: 'pp-3', projectId: 'project-1', paintStockId: 'paint-stock-4' }, // スーパークリア
  // project-2 (シャアザク) で使ってる塗料
  { id: 'pp-4', projectId: 'project-2', paintStockId: 'paint-stock-7' }, // ガイア フレームレッド
  { id: 'pp-5', projectId: 'project-2', paintStockId: 'paint-stock-1' }, // ホワイト
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

export async function getProjects(input: { userId: string }): Promise<Project[]> {
  return projects.filter((p) => p.userId === input.userId)
}

export async function getProject(input: { projectId: string; userId: string }): Promise<Project | null> {
  return projects.find((p) => p.id === input.projectId && p.userId === input.userId) ?? null
}

/** project に紐付く paint_stock_id 一覧 */
export async function getProjectPaintStockIds(input: { projectId: string }): Promise<string[]> {
  return projectPaints
    .filter((link) => link.projectId === input.projectId)
    .map((link) => link.paintStockId)
}

export async function getProjectPhotos(input: { projectId: string }): Promise<ProjectPhoto[]> {
  return projectPhotos.filter((ph) => ph.projectId === input.projectId)
}

// === Mutations ===

let projectIdCounter = projects.length + 1
let projectPaintIdCounter = projectPaints.length + 1
let projectPhotoIdCounter = projectPhotos.length + 1

export async function addProject(input: {
  userId: string
  name: string
  description?: string | null
  kitStockId?: string | null
}): Promise<Project> {
  const newProject: Project = {
    id: `project-${projectIdCounter++}`,
    userId: input.userId,
    name: input.name,
    description: input.description ?? null,
    status: 'planning',
    startedAt: null,
    completedAt: null,
    kitStockId: input.kitStockId ?? null,
  }
  projects.push(newProject)
  return newProject
}

export async function updateProject(input: {
  projectId: string
  userId: string
  patch: Partial<Pick<Project, 'name' | 'description' | 'status' | 'startedAt' | 'completedAt' | 'kitStockId'>>
}): Promise<Project | null> {
  const idx = projects.findIndex((p) => p.id === input.projectId && p.userId === input.userId)
  if (idx === -1) return null
  projects[idx] = { ...projects[idx], ...input.patch }
  return projects[idx]
}

export async function deleteProject(input: { projectId: string; userId: string }): Promise<boolean> {
  const idx = projects.findIndex((p) => p.id === input.projectId && p.userId === input.userId)
  if (idx === -1) return false
  projects.splice(idx, 1)
  // 紐付く project_paints, project_photos も削除 (cascade)
  for (let i = projectPaints.length - 1; i >= 0; i--) {
    if (projectPaints[i].projectId === input.projectId) projectPaints.splice(i, 1)
  }
  for (let i = projectPhotos.length - 1; i >= 0; i--) {
    if (projectPhotos[i].projectId === input.projectId) projectPhotos.splice(i, 1)
  }
  return true
}

export async function addProjectPaint(input: {
  projectId: string
  paintStockId: string
}): Promise<ProjectPaintLink> {
  const newLink: ProjectPaintLink = {
    id: `pp-${projectPaintIdCounter++}`,
    projectId: input.projectId,
    paintStockId: input.paintStockId,
  }
  projectPaints.push(newLink)
  return newLink
}

export async function removeProjectPaint(input: {
  projectId: string
  paintStockId: string
}): Promise<boolean> {
  const idx = projectPaints.findIndex(
    (link) => link.projectId === input.projectId && link.paintStockId === input.paintStockId,
  )
  if (idx === -1) return false
  projectPaints.splice(idx, 1)
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

/**
 * 指定 kit_stock_id を kitStockId に持つ project を全て探し、kitStockId を null にする。
 * Phase C で D1 の ON DELETE SET NULL FK 制約に置換予定 (現状はアプリ層で代替)。
 */
export async function nullifyKitStockIdInProjects(input: { kitStockId: string }): Promise<void> {
  for (const p of projects) {
    if (p.kitStockId === input.kitStockId) {
      p.kitStockId = null
    }
  }
}
