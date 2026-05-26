import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders } from '~/test-utils/react'

const invalidate = vi.fn().mockResolvedValue(undefined)
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate }),
}))

vi.mock('~/features/project-paint-use', () => ({
  removeProjectPaintUse: vi.fn(),
}))

import { removeProjectPaintUse } from '~/features/project-paint-use'
import { useRemoveProjectPaint } from './useRemoveProjectPaint'

const removeProjectPaintUseMock = vi.mocked(removeProjectPaintUse)

describe('useRemoveProjectPaint', () => {
  beforeEach(() => {
    removeProjectPaintUseMock.mockResolvedValue(true)
    invalidate.mockClear()
  })
  afterEach(() => {
    removeProjectPaintUseMock.mockClear()
  })

  it('handleRemovePaint で removeProjectPaintUse が projectId / paintId 付きで呼ばれ、router.invalidate も呼ばれる', async () => {
    const { result } = renderHookWithProviders(() =>
      useRemoveProjectPaint({ projectId: 'project-1' }),
    )
    await act(async () => {
      await result.current.handleRemovePaint('paint-1')
    })
    expect(removeProjectPaintUseMock).toHaveBeenCalledWith({
      data: { projectId: 'project-1', paintId: 'paint-1' },
    })
    expect(invalidate).toHaveBeenCalledOnce()
  })

  it('projectId が null のとき removeProjectPaintUse も router.invalidate も呼ばれない (早期 return)', async () => {
    const { result } = renderHookWithProviders(() => useRemoveProjectPaint({ projectId: null }))
    await act(async () => {
      await result.current.handleRemovePaint('paint-1')
    })
    expect(removeProjectPaintUseMock).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalled()
  })
})
