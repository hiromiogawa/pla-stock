import { describe, expect, it } from 'vitest'
import { projectPaintUseServerInput } from './schemas'

describe('projectPaintUseServerInput', () => {
  it('正常入力を parse し正しい shape を返す', () => {
    const result = projectPaintUseServerInput({
      projectId: 'project-1',
      paintId: 'paint-1',
    })
    expect(result).toEqual({
      projectId: 'project-1',
      paintId: 'paint-1',
    })
  })

  it('projectId が空のとき reject', () => {
    expect(() =>
      projectPaintUseServerInput({
        projectId: '',
        paintId: 'paint-1',
      }),
    ).toThrow()
  })

  it('paintId が空のとき reject', () => {
    expect(() =>
      projectPaintUseServerInput({
        projectId: 'project-1',
        paintId: '',
      }),
    ).toThrow()
  })

  it('余分な userId フィールドは無視される (IDOR 防止仕様)', () => {
    const result = projectPaintUseServerInput({
      projectId: 'project-1',
      paintId: 'paint-1',
      userId: 'evil-user-id',
    })
    expect(result).not.toHaveProperty('userId')
  })
})
