import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
import { deleteProjectPhoto } from '~/features/project-photo-delete'

interface UseDeleteProjectPhotoReturn {
  handleRemovePhoto: (photoId: string) => Promise<void>
}

/**
 * プロジェクト写真削除 mutation を担う micro hook。
 * 担当: deleteProjectPhoto server fn 呼び出し (R2 delete + D1) / router.invalidate() / 成功時 snackbar。
 * photoId は写真自体が project と紐付くため projectId は不要 (server fn 内で逆引き)。
 */
export function useDeleteProjectPhoto(): UseDeleteProjectPhotoReturn {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const handleRemovePhoto = useCallback(
    async (photoId: string) => {
      const ok = await deleteProjectPhoto({ data: { photoId } })
      if (ok) {
        await router.invalidate()
        enqueueSnackbar('写真を削除しました', { variant: 'success' })
      }
    },
    [router, enqueueSnackbar],
  )

  return { handleRemovePhoto }
}
