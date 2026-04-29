import { Link } from '@tanstack/react-router'
import type { Kit } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { ProjectCreateForm } from './ProjectCreateForm'
import type { UseProjectCreateReturn } from './useProjectCreate'

interface ProjectCreateViewProps extends UseProjectCreateReturn {
  /** count > 0 の自分の在庫キットだけ */
  selectableKits: Kit[]
  /** kitId → 在庫数 (selectableKits に対応) */
  stockCountByKitId: Record<string, number>
}

export function ProjectCreateView({
  selectableKits,
  stockCountByKitId,
  handleSubmit,
  handleCancel,
}: ProjectCreateViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">新規プロジェクトを作成</h1>
        <p className="text-sm text-muted-foreground mt-1">
          在庫キットを 1 つ選んでプロジェクト化します。作成と同時に在庫が 1 減ります。
        </p>
      </div>

      {selectableKits.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <p className="text-sm">在庫キットがありません。先にキットを追加してください。</p>
          <div className="flex gap-2">
            <Button component={Link} to="/kits/new">
              + キットを追加
            </Button>
            <Button variant="outline" component={Link} to="/projects">
              プロジェクト一覧へ
            </Button>
          </div>
        </div>
      ) : (
        <ProjectCreateForm
          selectableKits={selectableKits}
          stockCountByKitId={stockCountByKitId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
