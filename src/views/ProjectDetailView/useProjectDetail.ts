import { useCallback, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
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

export function useProjectDetail(input: UseProjectDetailInput): UseProjectDetailReturn {
  const navigate = useNavigate()
  const router = useRouter()
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
      } else {
        console.warn('updateProject returned null')
      }
    },
    [project, userId, router],
  )

  const handleDelete = useCallback(async () => {
    if (!project) return
    const ok = await deleteProject({ projectId: project.id, userId })
    if (ok) {
      void navigate({ to: '/projects' })
    } else {
      console.warn('deleteProject returned false')
    }
  }, [project, userId, navigate])

  const handleAddPaint = useCallback(
    async (paintId: string) => {
      if (!project) return
      await addProjectPaintUse({ projectId: project.id, paintId })
      await router.invalidate()
    },
    [project, router],
  )

  const handleRemovePaint = useCallback(
    async (paintId: string) => {
      if (!project) return
      await removeProjectPaintUse({ projectId: project.id, paintId })
      await router.invalidate()
    },
    [project, router],
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
    },
    [project, router],
  )

  const handleRemovePhoto = useCallback(
    async (photoId: string) => {
      const ok = await deleteProjectPhoto({ photoId })
      if (ok) {
        await router.invalidate()
      }
    },
    [router],
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
