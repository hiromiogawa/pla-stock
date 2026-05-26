import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
import { addProjectPaintUse } from '~/features/project-paint-use'

interface UseAddProjectPaintInput {
  projectId: string | null
}

interface UseAddProjectPaintReturn {
  handleAddPaint: (paintId: string) => Promise<void>
}

/**
 * プロジェクトに塗料を紐付ける mutation を担う micro hook。
 * 担当: addProjectPaintUse server fn 呼び出し / router.invalidate() / 成功 snackbar / 早期 return (projectId null)。
 * 在庫数には影響しない (紐付け = use 記録のみ)。
 */
export function useAddProjectPaint({
  projectId,
}: UseAddProjectPaintInput): UseAddProjectPaintReturn {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const handleAddPaint = useCallback(
    async (paintId: string) => {
      if (!projectId) return
      await addProjectPaintUse({ data: { projectId, paintId } })
      await router.invalidate()
      enqueueSnackbar('塗料を紐付けました', { variant: 'success' })
    },
    [projectId, router, enqueueSnackbar],
  )

  return { handleAddPaint }
}
