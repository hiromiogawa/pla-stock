import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-react-start'
import type { Project } from '~/entities/project'
import type { Kit } from '~/entities/kit'
import type { Paint } from '~/entities/paint'
import type { ProjectPhoto } from '~/entities/project'
import {
  deleteProject,
  updateProject,
  addProjectPaintUse,
  removeProjectPaintUse,
  addProjectPhoto,
  deleteProjectPhoto,
} from '~/shared/api/mock/projects'
import { Button } from '~/shared/ui/button'
import { ProjectDetailHeader } from './ProjectDetailHeader'
import { ProjectDetailFields } from './ProjectDetailFields'
import { ProjectEditForm, type ProjectEditValues } from './ProjectEditForm'
import { ProjectDeleteDialog } from './ProjectDeleteDialog'
import { LinkedKit } from './LinkedKit'
import { ProjectPaintUses } from './ProjectPaintUses'
import { ProjectPhotos } from './ProjectPhotos'
import type { AddPhotoInput } from './AddPhotoDialog'

export interface ProjectDetailViewProps {
  project: Project | null
  kit: Kit | null
  paintsForProject: Paint[]
  allPaints: Paint[]
  photos: ProjectPhoto[]
}

export function ProjectDetailView({
  project,
  kit,
  paintsForProject,
  allPaints,
  photos,
}: ProjectDetailViewProps) {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentProject, setCurrentProject] = useState(project)
  const [currentPaints, setCurrentPaints] = useState(paintsForProject)
  const [currentPhotos, setCurrentPhotos] = useState(photos)

  if (!currentProject || !kit || !userId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 md:px-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">プロジェクトが見つかりません</h1>
        <Button onClick={() => navigate({ to: '/projects' })}>
          プロジェクト一覧へ戻る
        </Button>
      </div>
    )
  }

  const handleSave = async (values: ProjectEditValues) => {
    const updated = await updateProject({
      projectId: currentProject.id,
      userId,
      patch: values,
    })
    if (updated) {
      setCurrentProject(updated)
      setEditing(false)
    } else {
      console.warn('updateProject returned null')
    }
  }

  const handleDelete = async () => {
    const ok = await deleteProject({ projectId: currentProject.id, userId })
    if (ok) {
      void navigate({ to: '/projects' })
    } else {
      console.warn('deleteProject returned false')
    }
  }

  const handleAddPaint = async (paintId: string) => {
    await addProjectPaintUse({ projectId: currentProject.id, paintId })
    const paint = allPaints.find((p) => p.id === paintId)
    if (paint && !currentPaints.some((p) => p.id === paintId)) {
      setCurrentPaints([...currentPaints, paint])
    }
  }

  const handleRemovePaint = async (paintId: string) => {
    await removeProjectPaintUse({ projectId: currentProject.id, paintId })
    setCurrentPaints(currentPaints.filter((p) => p.id !== paintId))
  }

  const handleAddPhoto = async (input: AddPhotoInput) => {
    const newPhoto = await addProjectPhoto({
      projectId: currentProject.id,
      url: input.url,
      caption: input.caption ?? null,
      takenAt: input.takenAt ?? null,
    })
    setCurrentPhotos([...currentPhotos, newPhoto])
  }

  const handleRemovePhoto = async (photoId: string) => {
    const ok = await deleteProjectPhoto({ photoId })
    if (ok) {
      setCurrentPhotos(currentPhotos.filter((ph) => ph.id !== photoId))
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <ProjectDetailHeader
        project={currentProject}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      {editing ? (
        <ProjectEditForm
          project={currentProject}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProjectDetailFields project={currentProject} />
      )}
      <LinkedKit kit={kit} />
      <ProjectPaintUses
        paints={currentPaints}
        allPaints={allPaints}
        onAdd={handleAddPaint}
        onRemove={handleRemovePaint}
      />
      <ProjectPhotos
        photos={currentPhotos}
        onAdd={handleAddPhoto}
        onRemove={handleRemovePhoto}
      />
      <ProjectDeleteDialog
        open={showDeleteDialog}
        projectName={currentProject.name}
        projectStatus={currentProject.status}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  )
}
