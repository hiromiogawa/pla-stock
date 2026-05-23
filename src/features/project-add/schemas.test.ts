import { describe, expect, it } from 'vitest'
import { addProjectServerInput } from './schemas'

describe('addProjectServerInput', () => {
  it('正常入力 (description あり) を parse し正しい shape を返す', () => {
    const result = addProjectServerInput({
      kitId: 'kit-1',
      name: 'Sazabi 製作',
      description: 'シャア専用カラーで',
    })
    expect(result).toEqual({
      kitId: 'kit-1',
      name: 'Sazabi 製作',
      description: 'シャア専用カラーで',
    })
  })

  it('正常入力 (description なし) を parse', () => {
    const result = addProjectServerInput({
      kitId: 'kit-1',
      name: 'Sazabi 製作',
    })
    expect(result.kitId).toBe('kit-1')
    expect(result.name).toBe('Sazabi 製作')
  })

  it('kitId が空のとき reject', () => {
    expect(() =>
      addProjectServerInput({
        kitId: '',
        name: 'Sazabi 製作',
      }),
    ).toThrow()
  })

  it('name が空のとき reject', () => {
    expect(() =>
      addProjectServerInput({
        kitId: 'kit-1',
        name: '',
      }),
    ).toThrow()
  })

  it('name が 200 文字超のとき reject', () => {
    expect(() =>
      addProjectServerInput({
        kitId: 'kit-1',
        name: 'a'.repeat(201),
      }),
    ).toThrow()
  })

  it('description が 2000 文字超のとき reject', () => {
    expect(() =>
      addProjectServerInput({
        kitId: 'kit-1',
        name: 'Sazabi 製作',
        description: 'a'.repeat(2001),
      }),
    ).toThrow()
  })

  it('余分な userId フィールドは無視される (IDOR 防止仕様)', () => {
    const result = addProjectServerInput({
      kitId: 'kit-1',
      name: 'Sazabi 製作',
      userId: 'evil-user-id',
    })
    expect(result).not.toHaveProperty('userId')
  })
})
