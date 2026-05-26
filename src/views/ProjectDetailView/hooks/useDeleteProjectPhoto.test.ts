import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders } from '~/test-utils/react'

const invalidate = vi.fn().mockResolvedValue(undefined)
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate }),
}))

vi.mock('~/features/project-photo-delete', () => ({
  deleteProjectPhoto: vi.fn(),
}))

import { deleteProjectPhoto } from '~/features/project-photo-delete'
import { useDeleteProjectPhoto } from './useDeleteProjectPhoto'

const deleteProjectPhotoMock = vi.mocked(deleteProjectPhoto)

describe('useDeleteProjectPhoto', () => {
  beforeEach(() => {
    deleteProjectPhotoMock.mockResolvedValue(true)
    invalidate.mockClear()
  })
  afterEach(() => {
    deleteProjectPhotoMock.mockClear()
  })

  it('handleRemovePhoto で deleteProjectPhoto が photoId 付きで呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useDeleteProjectPhoto())
    await act(async () => {
      await result.current.handleRemovePhoto('photo-1')
    })
    expect(deleteProjectPhotoMock).toHaveBeenCalledWith({ data: { photoId: 'photo-1' } })
  })

  it('成功時に router.invalidate が呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useDeleteProjectPhoto())
    await act(async () => {
      await result.current.handleRemovePhoto('photo-1')
    })
    expect(invalidate).toHaveBeenCalledOnce()
  })

  it('失敗時 (false 戻り) に router.invalidate が呼ばれない', async () => {
    deleteProjectPhotoMock.mockResolvedValue(false)
    const { result } = renderHookWithProviders(() => useDeleteProjectPhoto())
    await act(async () => {
      await result.current.handleRemovePhoto('photo-1')
    })
    expect(invalidate).not.toHaveBeenCalled()
  })
})
