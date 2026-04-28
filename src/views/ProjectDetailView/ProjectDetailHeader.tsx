import type { Project } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

const STATUS_VARIANT: Record<Project['status'], 'default' | 'secondary' | 'outline'> = {
  planning: 'outline',
  building: 'secondary',
  completed: 'default',
  abandoned: 'outline',
}

interface ProjectDetailHeaderProps {
  project: Project
  editing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
}

export function ProjectDetailHeader({
  project,
  editing,
  onEdit,
  onCancelEdit,
  onDelete,
}: ProjectDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={STATUS_VARIANT[project.status]}>{STATUS_LABEL[project.status]}</Badge>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {editing ? (
          <Button variant="outline" onClick={onCancelEdit}>
            キャンセル
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onEdit}>
              編集
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              削除
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
