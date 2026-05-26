import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHookWithProviders } from '~/test-utils/react'

const invalidate = vi.fn().mockResolvedValue(undefined)
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate }),
}))

vi.mock('~/features/project-photo-add', () => ({
  addProjectPhoto: vi.fn(),
}))

import { addProjectPhoto } from '~/features/project-photo-add'
import { useAddProjectPhoto } from './useAddProjectPhoto'

const addProjectPhotoMock = vi.mocked(addProjectPhoto)

describe('useAddProjectPhoto', () => {
  beforeEach(() => {
    addProjectPhotoMock.mockResolvedValue({
      id: 'photo-1',
      projectId: 'project-1',
      url: 'r2://photo-1',
      r2Key: 'u-1/2026/05/photo-1.webp',
      caption: null,
      takenAt: null,
    })
    invalidate.mockClear()
  })
  afterEach(() => {
    addProjectPhotoMock.mockClear()
  })

  it('handleAddPhoto で addProjectPhoto が FormData (projectId / file / caption / takenAt) で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useAddProjectPhoto({ projectId: 'project-1' }))
    const file = new File(['x'], 'x.webp', { type: 'image/webp' })
    await act(async () => {
      await result.current.handleAddPhoto({ file, caption: 'c', takenAt: '2026-05-01' })
    })
    expect(addProjectPhotoMock).toHaveBeenCalledOnce()
    const formData = addProjectPhotoMock.mock.calls[0]?.[0]?.data
    if (!(formData instanceof FormData)) throw new Error('expected FormData')
    expect(formData.get('projectId')).toBe('project-1')
    expect(formData.get('caption')).toBe('c')
    expect(formData.get('takenAt')).toBe('2026-05-01')
    expect(formData.get('file')).toBeInstanceOf(File)
    expect(invalidate).toHaveBeenCalledOnce()
  })

  it('caption / takenAt 未指定で空文字が送信される', async () => {
    const { result } = renderHookWithProviders(() => useAddProjectPhoto({ projectId: 'project-1' }))
    const file = new File(['x'], 'x.webp', { type: 'image/webp' })
    await act(async () => {
      await result.current.handleAddPhoto({ file })
    })
    const formData = addProjectPhotoMock.mock.calls[0]?.[0]?.data
    if (!(formData instanceof FormData)) throw new Error('expected FormData')
    expect(formData.get('caption')).toBe('')
    expect(formData.get('takenAt')).toBe('')
  })

  it('projectId が null のとき addProjectPhoto も router.invalidate も呼ばれない (早期 return)', async () => {
    const { result } = renderHookWithProviders(() => useAddProjectPhoto({ projectId: null }))
    const file = new File(['x'], 'x.webp', { type: 'image/webp' })
    await act(async () => {
      await result.current.handleAddPhoto({ file })
    })
    expect(addProjectPhotoMock).not.toHaveBeenCalled()
    expect(invalidate).not.toHaveBeenCalled()
  })
})
