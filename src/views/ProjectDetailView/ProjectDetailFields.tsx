import type { Project } from '~/entities/project'

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

function FieldRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-border last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value ?? '—'}</dd>
    </div>
  )
}

interface ProjectDetailFieldsProps {
  project: Project
}

export function ProjectDetailFields({ project }: ProjectDetailFieldsProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold mb-2">プロジェクト情報</h2>
      <dl>
        <FieldRow label="名前" value={project.name} />
        <FieldRow label="説明" value={project.description} />
        <FieldRow label="ステータス" value={STATUS_LABEL[project.status]} />
        <FieldRow label="開始日" value={project.startedAt} />
        <FieldRow label="完成日" value={project.completedAt} />
      </dl>
    </section>
  )
}
