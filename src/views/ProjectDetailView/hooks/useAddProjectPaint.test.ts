import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders } from '~/test-utils/react'

const invalidate = vi.fn().mockResolvedValue(undefined)
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate }),
}))

vi.mock('~/features/project-paint-use', () => ({
  addProjectPaintUse: vi.fn(),
}))

import { addProjectPaintUse } from '~/features/project-paint-use'
import { useAddProjectPaint } from './useAddProjectPaint'

const addProjectPaintUseMock = vi.mocked(addProjectPaintUse)

describe('useAddProjectPaint', () => {
  beforeEach(() => {
    addProjectPaintUseMock.mockResolvedValue({
      projectId: 'project-1',
      paintId: 'paint-1',
      createdAt: new Date(),
    })
    invalidate.mockClear()
  })
  afterEach(() => {
    addProjectPaintUseMock.mockClear()
  })

  it('handleAddPaint で addProjectPaintUse が projectId / paintId 付きで呼ばれ、router.invalidate も呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useAddProjectPaint({ projectId: 'project-1' }))
    await act(async () => {
      await result.current.handleAddPaint('paint-1')
    })
    expect(addProjectPaintUseMock).toHaveBeenCalledWith({
      data: { projectId: 'project-1', paintId: 'paint-1' },
    })
    expect(invalidate).toHaveBeenCalledOnce()
  })

  it('projectId が null のとき addProjectPaintUse も router.invalidate も呼ばれない (早期 return)', async () => {
    const { result } = renderHookWithProviders(() => useAddProjectPaint({ projectId: null }))
    await act(async () => {
      await result.current.handleAddPaint('paint-1')
    })
    expect(addProjectPaintUseMock).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalled()
  })
})
