import { Link } from '@tanstack/react-router'
import type { Project } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'

export interface ProjectCardProps {
  project: Project
  /** 紐付きキット名 (kit_stock_id 経由で resolve 済み)。null なら未紐付き。 */
  linkedKitName: string | null
}

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

const STATUS_VARIANT: Record<
  Project['status'],
  'default' | 'secondary' | 'outline'
> = {
  planning: 'outline',
  building: 'secondary',
  completed: 'default',
  abandoned: 'outline',
}

export function ProjectCard({ project, linkedKitName }: ProjectCardProps) {
  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      className="block rounded-lg border border-border bg-card p-4 space-y-2 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold flex-1 min-w-0 truncate">{project.name}</h3>
        <Badge variant={STATUS_VARIANT[project.status]} className="text-xs shrink-0">
          {STATUS_LABEL[project.status]}
        </Badge>
      </div>
      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
      )}
      <dl className="text-xs text-muted-foreground space-y-1">
        <div className="flex gap-2">
          <dt className="shrink-0">使用キット:</dt>
          <dd className="min-w-0 truncate text-foreground/80">{linkedKitName ?? '未紐付き'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">開始:</dt>
          <dd>{project.startedAt ?? '—'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0">完成:</dt>
          <dd>{project.completedAt ?? '—'}</dd>
        </div>
      </dl>
    </Link>
  )
}
