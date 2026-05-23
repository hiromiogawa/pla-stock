import { describe, expect, it } from 'vitest'
import { updateProjectServerInput } from './schemas'

describe('updateProjectServerInput', () => {
  it('正常入力 (patch 部分のみ) を parse', () => {
    const result = updateProjectServerInput({
      projectId: 'project-1',
      patch: { name: '更新後の名前' },
    })
    expect(result).toEqual({
      projectId: 'project-1',
      patch: { name: '更新後の名前' },
    })
  })

  it('正常入力 (全 patch field) を parse', () => {
    const result = updateProjectServerInput({
      projectId: 'project-1',
      patch: {
        name: '更新後の名前',
        description: '詳細',
        status: 'completed',
        startedAt: '2026-01-01',
        completedAt: '2026-03-15',
      },
    })
    expect(result.patch.status).toBe('completed')
  })

  it('projectId が空のとき reject', () => {
    expect(() =>
      updateProjectServerInput({
        projectId: '',
        patch: { name: 'X' },
      }),
    ).toThrow()
  })

  it('patch.status が enum 外のとき reject', () => {
    expect(() =>
      updateProjectServerInput({
        projectId: 'project-1',
        patch: { status: 'invalid-status' },
      }),
    ).toThrow()
  })

  it('patch.name が空文字のとき reject', () => {
    expect(() =>
      updateProjectServerInput({
        projectId: 'project-1',
        patch: { name: '' },
      }),
    ).toThrow()
  })

  it('patch.name が 200 文字超のとき reject', () => {
    expect(() =>
      updateProjectServerInput({
        projectId: 'project-1',
        patch: { name: 'a'.repeat(201) },
      }),
    ).toThrow()
  })

  it('余分な userId フィールドは無視される (IDOR 防止仕様)', () => {
    const result = updateProjectServerInput({
      projectId: 'project-1',
      patch: { name: 'X' },
      userId: 'evil-user-id',
    })
    expect(result).not.toHaveProperty('userId')
  })

  it('patch.kitId は schema に含まれず無視される (kitId 変更不可仕様)', () => {
    const result = updateProjectServerInput({
      projectId: 'project-1',
      patch: { name: 'X', kitId: 'other-kit' },
    })
    expect(result.patch).not.toHaveProperty('kitId')
  })
})
