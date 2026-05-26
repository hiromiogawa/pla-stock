import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
import { addProjectPhoto } from '~/features/project-photo-add'
import type { AddPhotoInput } from '../AddPhotoDialog'

interface UseAddProjectPhotoInput {
  projectId: string | null
}

interface UseAddProjectPhotoReturn {
  handleAddPhoto: (input: AddPhotoInput) => Promise<void>
}

/**
 * プロジェクト写真追加 mutation を担う micro hook。
 * 担当: FormData 組み立て / addProjectPhoto server fn 呼び出し (R2 put + D1) / router.invalidate() / 成功 snackbar / 早期 return (projectId null)。
 */
export function useAddProjectPhoto({
  projectId,
}: UseAddProjectPhotoInput): UseAddProjectPhotoReturn {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const handleAddPhoto = useCallback(
    async (input: AddPhotoInput) => {
      if (!projectId) return
      const formData = new FormData()
      formData.append('file', input.file)
      formData.append('projectId', projectId)
      formData.append('caption', input.caption ?? '')
      formData.append('takenAt', input.takenAt ?? '')
      await addProjectPhoto({ data: formData })
      await router.invalidate()
      enqueueSnackbar('写真を追加しました', { variant: 'success' })
    },
    [projectId, router, enqueueSnackbar],
  )

  return { handleAddPhoto }
}
