import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
import { updateProject } from '~/features/project-edit'
import type { ProjectEditValues } from '../ProjectEditForm'

interface UseUpdateProjectInput {
  projectId: string | null
  onSuccess?: () => void
}

interface UseUpdateProjectReturn {
  handleSave: (values: ProjectEditValues) => Promise<void>
}

/**
 * プロジェクト更新 mutation を担う micro hook。
 * 担当: updateProject server fn 呼び出し / router.invalidate() / 成否 snackbar / 早期 return (projectId null)。
 * onSuccess は Container が editing dialog 閉じ等を行うためのコールバック。
 */
export function useUpdateProject({
  projectId,
  onSuccess,
}: UseUpdateProjectInput): UseUpdateProjectReturn {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const handleSave = useCallback(
    async (values: ProjectEditValues) => {
      if (!projectId) return
      const updated = await updateProject({ data: { projectId, patch: values } })
      if (updated) {
        onSuccess?.()
        await router.invalidate()
        enqueueSnackbar('プロジェクトを更新しました', { variant: 'success' })
      } else {
        enqueueSnackbar('プロジェクトの更新に失敗しました', { variant: 'error' })
      }
    },
    [projectId, router, enqueueSnackbar, onSuccess],
  )

  return { handleSave }
}
