import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
import { removeProjectPaintUse } from '~/features/project-paint-use'

interface UseRemoveProjectPaintInput {
  projectId: string | null
}

interface UseRemoveProjectPaintReturn {
  handleRemovePaint: (paintId: string) => Promise<void>
}

/**
 * プロジェクトの塗料紐付け解除 mutation を担う micro hook。
 * 担当: removeProjectPaintUse server fn 呼び出し / router.invalidate() / 成功 snackbar / 早期 return (projectId null)。
 * 在庫数には影響しない (use 記録の削除のみ)。
 */
export function useRemoveProjectPaint({
  projectId,
}: UseRemoveProjectPaintInput): UseRemoveProjectPaintReturn {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const handleRemovePaint = useCallback(
    async (paintId: string) => {
      if (!projectId) return
      await removeProjectPaintUse({ data: { projectId, paintId } })
      await router.invalidate()
      enqueueSnackbar('塗料を解除しました', { variant: 'success' })
    },
    [projectId, router, enqueueSnackbar],
  )

  return { handleRemovePaint }
}
