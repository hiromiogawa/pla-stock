import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
import { getKitStock } from '~/entities/kit'
import { addProject } from '~/entities/project'
import type { ProjectAddInput } from '~/features/project-add'

interface UseProjectCreateInput {
  userId: string
}

export interface UseProjectCreateReturn {
  handleSubmit: (values: ProjectAddInput) => Promise<void>
  handleCancel: () => void
}

/**
 * ProjectCreateView 用の Hook (Container/Hook/Presenter パターン)。
 *
 * 担当する state / 副作用:
 * - state なし (form state は ProjectCreateForm 側で完結)
 * - 提出前の前提チェック: getKitStock で count >= 1 を確認
 * - 作成: addProject (内部で addKitEvent({ delta: -1, reason: 'project' }) 自動発火 → kit_stock.count -= 1)
 * - 成功時は /projects/:newId (詳細) へ navigation
 * - 在庫不足 / 失敗時は Snackbar (notistack) で通知 (Phase β-3d で window.alert から移行)
 *
 * View (Presenter) は本 Hook の戻り値をそのまま props として受け取り、
 * useState / 副作用 / mutation 呼び出しは持たない (#43 ルール)。
 */
export function useProjectCreate(input: UseProjectCreateInput): UseProjectCreateReturn {
  const { userId } = input
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = useCallback(
    async (values: ProjectAddInput) => {
      const stock = await getKitStock({ userId, kitId: values.kitId })
      if (!stock || stock.count < 1) {
        enqueueSnackbar('選択したキットの在庫がありません。最新状態を確認してください。', {
          variant: 'warning',
        })
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
        enqueueSnackbar(
          `プロジェクト作成に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
          { variant: 'error' },
        )
      }
    },
    [userId, navigate, enqueueSnackbar],
  )

  const handleCancel = useCallback(() => {
    void navigate({ to: '/projects' })
  }, [navigate])

  return { handleSubmit, handleCancel }
}
