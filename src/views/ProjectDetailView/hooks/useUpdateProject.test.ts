import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders } from '~/test-utils/react'

const invalidate = vi.fn().mockResolvedValue(undefined)
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate }),
}))

vi.mock('~/features/project-edit', () => ({
  updateProject: vi.fn(),
}))

import { updateProject } from '~/features/project-edit'
import { createTestProject } from '~/test-utils/factories/project'
import { useUpdateProject } from './useUpdateProject'

const updateProjectMock = vi.mocked(updateProject)

const editValues = {
  name: 'new',
  description: null,
  status: 'building' as const,
  startedAt: '2026-05-01',
  completedAt: null,
}

describe('useUpdateProject', () => {
  beforeEach(() => {
    updateProjectMock.mockResolvedValue(createTestProject({ id: 'project-1', name: 'new' }))
    invalidate.mockClear()
  })
  afterEach(() => {
    updateProjectMock.mockClear()
  })

  it('handleSave で updateProject が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useUpdateProject({ projectId: 'project-1' }))
    await act(async () => {
      await result.current.handleSave(editValues)
    })
    expect(updateProjectMock).toHaveBeenCalledWith({
      data: { projectId: 'project-1', patch: editValues },
    })
  })

  it('成功時に onSuccess と router.invalidate が呼ばれる', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHookWithProviders(() =>
      useUpdateProject({ projectId: 'project-1', onSuccess }),
    )
    await act(async () => {
      await result.current.handleSave(editValues)
    })
    expect(onSuccess).toHaveBeenCalledOnce()
    expect(invalidate).toHaveBeenCalledOnce()
  })

  it('失敗時 (null 戻り) に onSuccess も router.invalidate も呼ばれない', async () => {
    updateProjectMock.mockResolvedValue(null)
    const onSuccess = vi.fn()
    const { result } = renderHookWithProviders(() =>
      useUpdateProject({ projectId: 'project-1', onSuccess }),
    )
    await act(async () => {
      await result.current.handleSave(editValues)
    })
    expect(onSuccess).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalled()
  })

  it('projectId が null のとき updateProject も router.invalidate も呼ばれない (早期 return)', async () => {
    const { result } = renderHookWithProviders(() => useUpdateProject({ projectId: null }))
    await act(async () => {
      await result.current.handleSave(editValues)
    })
    expect(updateProjectMock).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalled()
  })
})
