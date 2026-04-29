import { useCallback, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
import type { Project } from '~/entities/project'
import {
  addProjectPaintUse,
  addProjectPhoto,
  deleteProject,
  deleteProjectPhoto,
  removeProjectPaintUse,
  updateProject,
} from '~/entities/project'
import type { AddPhotoInput } from './AddPhotoDialog'
import type { ProjectEditValues } from './ProjectEditForm'

interface UseProjectDetailInput {
  project: Project | null
  userId: string
}

export interface UseProjectDetailReturn {
  editing: boolean
  showDeleteDialog: boolean
  setEditing: (editing: boolean) => void
  setShowDeleteDialog: (open: boolean) => void
  handleSave: (values: ProjectEditValues) => Promise<void>
  handleDelete: () => Promise<void>
  handleAddPaint: (paintId: string) => Promise<void>
  handleRemovePaint: (paintId: string) => Promise<void>
  handleAddPhoto: (input: AddPhotoInput) => Promise<void>
  handleRemovePhoto: (photoId: string) => Promise<void>
  handleBackToList: () => void
}

/**
 * ProjectDetailView 用の Hook (Container/Hook/Presenter パターン)。
 *
 * 担当する state / 副作用:
 * - 編集モード / 削除確認ダイアログの表示状態 (useState ×2)
 * - プロジェクト編集 (updateProject) / 削除 (deleteProject、planning なら kit 在庫戻し)
 * - 紐付け塗料の追加・削除 (addProjectPaintUse / removeProjectPaintUse、count 変化なし)
 * - 写真の追加・削除 (addProjectPhoto / deleteProjectPhoto)
 * - mutation 後は router.invalidate() で loader 再実行 → 最新 paints/photos を再取得
 * - 削除成功時は一覧へ navigation
 * - mutation 失敗 / null 戻り時は Snackbar (notistack) で error 通知
 * - mutation 成功時は Snackbar (notistack) で success 通知
 *
 * View (Presenter) は本 Hook の戻り値をそのまま props として受け取り、
 * useState / 副作用は持たない (#43 ルール)。
 */
export function useProjectDetail(input: UseProjectDetailInput): UseProjectDetailReturn {
  const navigate = useNavigate()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { project, userId } = input

  const handleSave = useCallback(
    async (values: ProjectEditValues) => {
      if (!project) return
      const updated = await updateProject({
        projectId: project.id,
        userId,
        patch: values,
      })
      if (updated) {
        setEditing(false)
        await router.invalidate()
        enqueueSnackbar('プロジェクトを更新しました', { variant: 'success' })
      } else {
        enqueueSnackbar('プロジェクトの更新に失敗しました', { variant: 'error' })
      }
    },
    [project, userId, router, enqueueSnackbar],
  )

  const handleDelete = useCallback(async () => {
    if (!project) return
    const ok = await deleteProject({ projectId: project.id, userId })
    if (ok) {
      enqueueSnackbar('プロジェクトを削除しました', { variant: 'success' })
      void navigate({ to: '/projects' })
    } else {
      enqueueSnackbar('プロジェクトの削除に失敗しました', { variant: 'error' })
    }
  }, [project, userId, navigate, enqueueSnackbar])

  const handleAddPaint = useCallback(
    async (paintId: string) => {
      if (!project) return
      await addProjectPaintUse({ projectId: project.id, paintId })
      await router.invalidate()
      enqueueSnackbar('塗料を紐付けました', { variant: 'success' })
    },
    [project, router, enqueueSnackbar],
  )

  const handleRemovePaint = useCallback(
    async (paintId: string) => {
      if (!project) return
      await removeProjectPaintUse({ projectId: project.id, paintId })
      await router.invalidate()
      enqueueSnackbar('塗料を解除しました', { variant: 'success' })
    },
    [project, router, enqueueSnackbar],
  )

  const handleAddPhoto = useCallback(
    async (photoInput: AddPhotoInput) => {
      if (!project) return
      await addProjectPhoto({
        projectId: project.id,
        url: photoInput.url,
        caption: photoInput.caption ?? null,
        takenAt: photoInput.takenAt ?? null,
      })
      await router.invalidate()
      enqueueSnackbar('写真を追加しました', { variant: 'success' })
    },
    [project, router, enqueueSnackbar],
  )

  const handleRemovePhoto = useCallback(
    async (photoId: string) => {
      const ok = await deleteProjectPhoto({ photoId })
      if (ok) {
        await router.invalidate()
        enqueueSnackbar('写真を削除しました', { variant: 'success' })
      }
    },
    [router, enqueueSnackbar],
  )

  const handleBackToList = useCallback(() => {
    void navigate({ to: '/projects' })
  }, [navigate])

  return {
    editing,
    showDeleteDialog,
    setEditing,
    setShowDeleteDialog,
    handleSave,
    handleDelete,
    handleAddPaint,
    handleRemovePaint,
    handleAddPhoto,
    handleRemovePhoto,
    handleBackToList,
  }
}
