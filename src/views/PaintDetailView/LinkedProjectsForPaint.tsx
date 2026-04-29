// Phase A-2: Kit 版 LinkedProjects (src/views/KitDetailView/LinkedProjects.tsx) の
// Paint 用コピー。section heading と prop 名のみ異なる。
// Phase B で汎用 LinkedProjectsList に統合予定。

import { Link } from '@tanstack/react-router'
import type { Project } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

interface LinkedProjectsForPaintProps {
  projects: Project[]
}

export function LinkedProjectsForPaint({ projects }: LinkedProjectsForPaintProps) {
  if (projects.length === 0) return null
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold mb-3">この塗料を使うプロジェクト</h2>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                // @ts-expect-error /projects/:id route is registered in Issue #20
                to={`/projects/${project.id}`}
                className="text-sm font-medium hover:underline truncate block"
              >
                {project.name}
              </Link>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {STATUS_LABEL[project.status]}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  )
}
