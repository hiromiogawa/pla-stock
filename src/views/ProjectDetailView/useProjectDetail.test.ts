import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestProject } from '~/test-utils/factories/project'
import { renderHookWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useRouter: () => ({ invalidate: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('~/features/project-edit', () => ({
  updateProject: vi.fn(),
}))
vi.mock('~/features/project-delete', () => ({
  deleteProject: vi.fn(),
}))
vi.mock('~/features/project-paint-use', () => ({
  addProjectPaintUse: vi.fn(),
  removeProjectPaintUse: vi.fn(),
}))
vi.mock('~/features/project-photo-add', () => ({
  addProjectPhoto: vi.fn(),
}))
vi.mock('~/features/project-photo-delete', () => ({
  deleteProjectPhoto: vi.fn(),
}))

import { deleteProject } from '~/features/project-delete'
import { updateProject } from '~/features/project-edit'
import { addProjectPaintUse, removeProjectPaintUse } from '~/features/project-paint-use'
import { addProjectPhoto } from '~/features/project-photo-add'
import { deleteProjectPhoto } from '~/features/project-photo-delete'
import { useProjectDetail } from './useProjectDetail'

const updateProjectMock = vi.mocked(updateProject)
const deleteProjectMock = vi.mocked(deleteProject)
const addProjectPaintUseMock = vi.mocked(addProjectPaintUse)
const removeProjectPaintUseMock = vi.mocked(removeProjectPaintUse)
const addProjectPhotoMock = vi.mocked(addProjectPhoto)
const deleteProjectPhotoMock = vi.mocked(deleteProjectPhoto)

describe('useProjectDetail', () => {
  const project = createTestProject({ id: 'project-1' })

  beforeEach(() => {
    updateProjectMock.mockResolvedValue({ ...project, name: 'updated' })
    deleteProjectMock.mockResolvedValue(true)
    addProjectPaintUseMock.mockResolvedValue({
      projectId: 'project-1',
      paintId: 'paint-1',
      createdAt: new Date(),
    })
    removeProjectPaintUseMock.mockResolvedValue(true)
    addProjectPhotoMock.mockResolvedValue({
      id: 'photo-1',
      projectId: 'project-1',
      url: 'r2://photo-1',
      r2Key: 'u-1/2026/05/photo-1.webp',
      caption: null,
      takenAt: null,
    })
    deleteProjectPhotoMock.mockResolvedValue(true)
  })

  afterEach(() => {
    updateProjectMock.mockClear()
    deleteProjectMock.mockClear()
    addProjectPaintUseMock.mockClear()
    removeProjectPaintUseMock.mockClear()
    addProjectPhotoMock.mockClear()
    deleteProjectPhotoMock.mockClear()
  })

  it('初期 state: editing=false / showDeleteDialog=false', () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project }))
    expect(result.current.editing).toBe(false)
    expect(result.current.showDeleteDialog).toBe(false)
  })

  it('setEditing(true) で state が反映される', () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project }))
    act(() => {
      result.current.setEditing(true)
    })
    expect(result.current.editing).toBe(true)
  })

  it('handleSave で updateProject が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project }))

    await act(async () => {
      await result.current.handleSave({
        name: 'new name',
        description: 'new desc',
        status: 'building',
        startedAt: '2026-05-01',
        completedAt: null,
      })
    })

    expect(updateProjectMock).toHaveBeenCalledOnce()
    expect(updateProjectMock).toHaveBeenCalledWith({
      data: {
        projectId: 'project-1',
        patch: expect.objectContaining({ name: 'new name', status: 'building' }),
      },
    })
  })

  it('handleDelete で deleteProject が呼ばれ、成功時は navigate', async () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project }))

    await act(async () => {
      await result.current.handleDelete()
    })

    expect(deleteProjectMock).toHaveBeenCalledOnce()
    expect(deleteProjectMock).toHaveBeenCalledWith({
      data: { projectId: 'project-1' },
    })
  })

  it('handleAddPaint で addProjectPaintUse が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project }))

    await act(async () => {
      await result.current.handleAddPaint('paint-1')
    })

    expect(addProjectPaintUseMock).toHaveBeenCalledWith({
      data: { projectId: 'project-1', paintId: 'paint-1' },
    })
  })

  it('handleRemovePaint で removeProjectPaintUse が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project }))

    await act(async () => {
      await result.current.handleRemovePaint('paint-1')
    })

    expect(removeProjectPaintUseMock).toHaveBeenCalledWith({
      data: { projectId: 'project-1', paintId: 'paint-1' },
    })
  })

  it('handleAddPhoto で addProjectPhoto が FormData で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project }))

    const file = new File(['test'], 'test.webp', { type: 'image/webp' })
    await act(async () => {
      await result.current.handleAddPhoto({
        file,
        caption: 'cap',
        takenAt: '2026-05-01',
      })
    })

    expect(addProjectPhotoMock).toHaveBeenCalledOnce()
    const callArg = addProjectPhotoMock.mock.calls[0]?.[0]
    expect(callArg?.data).toBeInstanceOf(FormData)
  })

  it('handleRemovePhoto で deleteProjectPhoto が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project }))

    await act(async () => {
      await result.current.handleRemovePhoto('photo-1')
    })

    expect(deleteProjectPhotoMock).toHaveBeenCalledWith({
      data: { photoId: 'photo-1' },
    })
  })

  it('project が null のとき mutation handler は早期 return', async () => {
    const { result } = renderHookWithProviders(() => useProjectDetail({ project: null }))

    await act(async () => {
      await result.current.handleSave({
        name: 'X',
        description: null,
        status: 'planning',
        startedAt: null,
        completedAt: null,
      })
      await result.current.handleDelete()
      await result.current.handleAddPaint('paint-1')
      await result.current.handleRemovePaint('paint-1')
    })

    expect(updateProjectMock).not.toHaveBeenCalled()
    expect(deleteProjectMock).not.toHaveBeenCalled()
    expect(addProjectPaintUseMock).not.toHaveBeenCalled()
    expect(removeProjectPaintUseMock).not.toHaveBeenCalled()
  })
})
