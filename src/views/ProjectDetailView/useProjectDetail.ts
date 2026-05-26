import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Project } from '~/entities/project'
import { useAddProjectPaint } from './hooks/useAddProjectPaint'
import { useAddProjectPhoto } from './hooks/useAddProjectPhoto'
import { useDeleteProject } from './hooks/useDeleteProject'
import { useDeleteProjectPhoto } from './hooks/useDeleteProjectPhoto'
import { useRemoveProjectPaint } from './hooks/useRemoveProjectPaint'
import { useUpdateProject } from './hooks/useUpdateProject'

/**
 * ProjectDetailView 用 Container hook (#43 / #165)。
 * state (editing / showDeleteDialog) 保持 + 6 個の mutation micro hook を composition、
 * onSuccess に Container 固有の副作用 (navigate / setEditing) を差し込む。
 */
export function useProjectDetail(input: { project: Project | null }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const projectId = input.project?.id ?? null
  const { handleSave } = useUpdateProject({ projectId, onSuccess: () => setEditing(false) })
  const { handleDelete } = useDeleteProject({
    projectId,
    onSuccess: () => void navigate({ to: '/projects' }),
  })
  const { handleAddPaint } = useAddProjectPaint({ projectId })
  const { handleRemovePaint } = useRemoveProjectPaint({ projectId })
  const { handleAddPhoto } = useAddProjectPhoto({ projectId })
  const { handleRemovePhoto } = useDeleteProjectPhoto()

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

export type UseProjectDetailReturn = ReturnType<typeof useProjectDetail>
