import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Project } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { ProjectFilterBar, INITIAL_FILTERS, type ProjectFilters } from './ProjectFilterBar'
import { ProjectTable } from './ProjectTable'
import { ProjectCardList } from './ProjectCardList'

interface ProjectListViewProps {
  projects: Project[]
  /** project.id → 紐付きキット名 (未紐付き or 解決失敗時は null) の map */
  kitNameByProjectId: Record<string, string | null>
}

export function ProjectListView({ projects, kitNameByProjectId }: ProjectListViewProps) {
  const [filters, setFilters] = useState<ProjectFilters>(INITIAL_FILTERS)

  const rows = useMemo(() => {
    return projects
      .map((project) => ({
        project,
        linkedKitName: kitNameByProjectId[project.id] ?? null,
      }))
      .filter(({ project }) => {
        if (filters.search) {
          const q = filters.search.toLowerCase()
          if (!project.name.toLowerCase().includes(q)) return false
        }
        if (filters.status !== 'all' && project.status !== filters.status) return false
        return true
      })
  }, [projects, kitNameByProjectId, filters])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">プロジェクト</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} 件中 {rows.length} 件を表示
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/new">+ 作成</Link>
        </Button>
      </div>
      <ProjectFilterBar filters={filters} onChange={setFilters} />
      <div className="md:hidden">
        <ProjectCardList rows={rows} />
      </div>
      <div className="hidden md:block">
        <ProjectTable rows={rows} />
      </div>
    </div>
  )
}
