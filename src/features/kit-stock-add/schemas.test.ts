import { describe, expect, it } from 'vitest'
import { addKitEventInput } from './schemas'

describe('addKitEventInput', () => {
  it('正常入力を parse し正しい shape を返す', () => {
    const result = addKitEventInput({
      kitId: 'kit-1',
      delta: 1,
      reason: 'purchase',
    })
    expect(result).toEqual({
      kitId: 'kit-1',
      delta: 1,
      reason: 'purchase',
    })
  })

  it('delta が 0 のとき reject', () => {
    expect(() =>
      addKitEventInput({
        kitId: 'kit-1',
        delta: 0,
        reason: 'purchase',
      }),
    ).toThrow(/delta must be non-zero/)
  })

  it('priceYen が負の値のとき reject (nonnegative)', () => {
    expect(() =>
      addKitEventInput({
        kitId: 'kit-1',
        delta: 1,
        reason: 'purchase',
        priceYen: -1,
      }),
    ).toThrow()
  })

  it('余分な userId フィールドは無視される (IDOR 防止仕様)', () => {
    const result = addKitEventInput({
      kitId: 'kit-1',
      delta: 1,
      reason: 'purchase',
      userId: 'evil-user-id',
    })
    expect(result).not.toHaveProperty('userId')
  })

  it('kitId が空のとき reject', () => {
    expect(() =>
      addKitEventInput({
        kitId: '',
        delta: 1,
        reason: 'purchase',
      }),
    ).toThrow()
  })
})
