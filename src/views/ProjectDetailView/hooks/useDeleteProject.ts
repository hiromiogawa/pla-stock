import { useCallback } from 'react'
import { useSnackbar } from 'notistack'
import { deleteProject } from '~/features/project-delete'

interface UseDeleteProjectInput {
  projectId: string | null
  onSuccess?: () => void
}

interface UseDeleteProjectReturn {
  handleDelete: () => Promise<void>
}

/**
 * プロジェクト削除 mutation を担う micro hook。
 * 担当: deleteProject server fn 呼び出し / 成否 snackbar / 早期 return (projectId null)。
 * onSuccess は Container が一覧へ navigate するためのコールバック。
 * 削除成功時の planning kit 在庫戻しは server fn 側で完結する。
 */
export function useDeleteProject({
  projectId,
  onSuccess,
}: UseDeleteProjectInput): UseDeleteProjectReturn {
  const { enqueueSnackbar } = useSnackbar()

  const handleDelete = useCallback(async () => {
    if (!projectId) return
    const ok = await deleteProject({ data: { projectId } })
    if (ok) {
      enqueueSnackbar('プロジェクトを削除しました', { variant: 'success' })
      onSuccess?.()
    } else {
      enqueueSnackbar('プロジェクトの削除に失敗しました', { variant: 'error' })
    }
  }, [projectId, enqueueSnackbar, onSuccess])

  return { handleDelete }
}
