import { describe, expect, it } from 'vitest'
import { deleteProjectServerInput } from './schemas'

describe('deleteProjectServerInput', () => {
  it('正常入力を parse し正しい shape を返す', () => {
    const result = deleteProjectServerInput({ projectId: 'project-1' })
    expect(result).toEqual({ projectId: 'project-1' })
  })

  it('projectId が空のとき reject', () => {
    expect(() => deleteProjectServerInput({ projectId: '' })).toThrow()
  })

  it('余分な userId フィールドは無視される (IDOR 防止仕様)', () => {
    const result = deleteProjectServerInput({
      projectId: 'project-1',
      userId: 'evil-user-id',
    })
    expect(result).not.toHaveProperty('userId')
  })
})
