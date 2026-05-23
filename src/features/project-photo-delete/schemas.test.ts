import { describe, expect, it } from 'vitest'
import { deleteProjectPhotoInput } from './schemas'

describe('deleteProjectPhotoInput', () => {
  it('正常入力を parse し正しい shape を返す', () => {
    const result = deleteProjectPhotoInput({ photoId: 'photo-1' })
    expect(result).toEqual({ photoId: 'photo-1' })
  })

  it('photoId が空のとき reject', () => {
    expect(() => deleteProjectPhotoInput({ photoId: '' })).toThrow()
  })

  it('余分な userId フィールドは無視される (IDOR 防止仕様)', () => {
    const result = deleteProjectPhotoInput({
      photoId: 'photo-1',
      userId: 'evil-user-id',
    })
    expect(result).not.toHaveProperty('userId')
  })
})
