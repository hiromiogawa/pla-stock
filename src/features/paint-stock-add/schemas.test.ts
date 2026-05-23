import { describe, expect, it } from 'vitest'
import { addPaintEventInput } from './schemas'

describe('addPaintEventInput', () => {
  it('正常入力を parse し正しい shape を返す', () => {
    const result = addPaintEventInput({
      paintId: 'paint-1',
      delta: 1,
      reason: 'purchase',
    })
    expect(result).toEqual({
      paintId: 'paint-1',
      delta: 1,
      reason: 'purchase',
    })
  })

  it('delta が 0 のとき reject', () => {
    expect(() =>
      addPaintEventInput({
        paintId: 'paint-1',
        delta: 0,
        reason: 'purchase',
      }),
    ).toThrow(/delta must be non-zero/)
  })

  it('priceYen が負の値のとき reject (nonnegative)', () => {
    expect(() =>
      addPaintEventInput({
        paintId: 'paint-1',
        delta: 1,
        reason: 'purchase',
        priceYen: -1,
      }),
    ).toThrow()
  })

  it('余分な userId フィールドは無視される (IDOR 防止仕様)', () => {
    const result = addPaintEventInput({
      paintId: 'paint-1',
      delta: 1,
      reason: 'purchase',
      userId: 'evil-user-id',
    })
    expect(result).not.toHaveProperty('userId')
  })

  it('paintId が空のとき reject', () => {
    expect(() =>
      addPaintEventInput({
        paintId: '',
        delta: 1,
        reason: 'purchase',
      }),
    ).toThrow()
  })

  it('reason が enum 外のとき reject', () => {
    expect(() =>
      addPaintEventInput({
        paintId: 'paint-1',
        delta: 1,
        reason: 'invalid-reason',
      }),
    ).toThrow()
  })
})
