import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders } from '~/test-utils/react'

vi.mock('~/features/project-delete', () => ({
  deleteProject: vi.fn(),
}))

import { deleteProject } from '~/features/project-delete'
import { useDeleteProject } from './useDeleteProject'

const deleteProjectMock = vi.mocked(deleteProject)

describe('useDeleteProject', () => {
  beforeEach(() => {
    deleteProjectMock.mockResolvedValue(true)
  })
  afterEach(() => {
    deleteProjectMock.mockClear()
  })

  it('handleDelete で deleteProject が projectId 付きで呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useDeleteProject({ projectId: 'project-1' }))
    await act(async () => {
      await result.current.handleDelete()
    })
    expect(deleteProjectMock).toHaveBeenCalledWith({ data: { projectId: 'project-1' } })
  })

  it('成功時に onSuccess が呼ばれる', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHookWithProviders(() =>
      useDeleteProject({ projectId: 'project-1', onSuccess }),
    )
    await act(async () => {
      await result.current.handleDelete()
    })
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('失敗時 (false 戻り) に onSuccess が呼ばれない', async () => {
    deleteProjectMock.mockResolvedValue(false)
    const onSuccess = vi.fn()
    const { result } = renderHookWithProviders(() =>
      useDeleteProject({ projectId: 'project-1', onSuccess }),
    )
    await act(async () => {
      await result.current.handleDelete()
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('projectId が null のとき deleteProject は呼ばれない (早期 return)', async () => {
    const { result } = renderHookWithProviders(() => useDeleteProject({ projectId: null }))
    await act(async () => {
      await result.current.handleDelete()
    })
    expect(deleteProjectMock).not.toHaveBeenCalled()
  })
})
