import { Link, useNavigate } from '@tanstack/react-router'
import type { Kit } from '~/entities/kit'
import type { ProjectAddInput } from '~/features/project-add'
import { addProject } from '~/entities/project'
import { getKitStock } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { ProjectCreateForm } from './ProjectCreateForm'

interface ProjectCreateViewProps {
  /** count > 0 の自分の在庫キットだけ */
  selectableKits: Kit[]
  /** kitId → 在庫数 (selectableKits に対応) */
  stockCountByKitId: Record<string, number>
  userId: string
}

export function ProjectCreateView({
  selectableKits,
  stockCountByKitId,
  userId,
}: ProjectCreateViewProps) {
  const navigate = useNavigate()

  const handleSubmit = async (values: ProjectAddInput) => {
    // 前提チェック: kit_stock.count >= 1
    const stock = await getKitStock({ userId, kitId: values.kitId })
    if (!stock || stock.count < 1) {
      window.alert('選択したキットの在庫がありません。最新状態を確認してください。')
      return
    }

    try {
      const newProject = await addProject({
        userId,
        kitId: values.kitId,
        name: values.name,
        description: values.description ?? null,
      })
      void navigate({
        to: '/projects/$id',
        params: { id: newProject.id },
      })
    } catch (err) {
      window.alert(
        `プロジェクト作成に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  const handleCancel = () => {
    void navigate({ to: '/projects' })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
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
            <Button asChild>
              <Link to="/kits/new">+ キットを追加</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/projects">プロジェクト一覧へ</Link>
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
