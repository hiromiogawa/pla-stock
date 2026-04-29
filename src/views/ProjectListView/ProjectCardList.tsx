import type { Project } from '~/entities/project'
import { ProjectCard } from '~/widgets/ProjectCard'

interface ProjectCardListRow {
  project: Project
  linkedKitName: string | null
  linkedKitBoxArtUrl: string | null
}

interface ProjectCardListProps {
  rows: ProjectCardListRow[]
}

export function ProjectCardList({ rows }: ProjectCardListProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
        該当するプロジェクトがありません
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {rows.map(({ project, linkedKitName, linkedKitBoxArtUrl }) => (
        <ProjectCard
          key={project.id}
          project={project}
          linkedKitName={linkedKitName}
          linkedKitBoxArtUrl={linkedKitBoxArtUrl}
        />
      ))}
    </div>
  )
}
