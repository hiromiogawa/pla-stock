import type { Project, ProjectPhoto } from '~/entities/project'
import type { Kit } from '~/entities/kit'
import type { Paint } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { ProjectDetailHeader } from './ProjectDetailHeader'
import { ProjectDetailFields } from './ProjectDetailFields'
import { ProjectEditForm } from './ProjectEditForm'
import { ProjectDeleteDialog } from './ProjectDeleteDialog'
import { LinkedKit } from './LinkedKit'
import { ProjectPaintUses } from './ProjectPaintUses'
import { ProjectPhotos } from './ProjectPhotos'
import type { UseProjectDetailReturn } from './useProjectDetail'

interface ProjectDetailViewProps extends UseProjectDetailReturn {
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
}: ProjectDetailViewProps) {
  if (!project || !kit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 md:px-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">プロジェクトが見つかりません</h1>
        <Button onClick={handleBackToList}>プロジェクト一覧へ戻る</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <ProjectDetailHeader
        project={project}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      {editing ? (
        <ProjectEditForm project={project} onSave={handleSave} onCancel={() => setEditing(false)} />
      ) : (
        <ProjectDetailFields project={project} />
      )}
      <LinkedKit kit={kit} />
      <ProjectPaintUses
        paints={paintsForProject}
        allPaints={allPaints}
        onAdd={handleAddPaint}
        onRemove={handleRemovePaint}
      />
      <ProjectPhotos photos={photos} onAdd={handleAddPhoto} onRemove={handleRemovePhoto} />
      <ProjectDeleteDialog
        open={showDeleteDialog}
        projectName={project.name}
        projectStatus={project.status}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  )
}
