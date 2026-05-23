import { describe, expect, it } from 'vitest'
import { extractFieldErrorMessage } from './form-error'

describe('extractFieldErrorMessage', () => {
  it('null を渡すと undefined を返す', () => {
    expect(extractFieldErrorMessage(null)).toBeUndefined()
  })

  it('undefined を渡すと undefined を返す', () => {
    expect(extractFieldErrorMessage(undefined)).toBeUndefined()
  })

  it('string を渡すとそのまま返す (関数 validator 経路)', () => {
    expect(extractFieldErrorMessage('必須項目です')).toBe('必須項目です')
  })

  it('object で message プロパティが string なら message を返す (Zod 経路)', () => {
    const zodLikeError = { message: '名前は必須です', path: ['name'] }
    expect(extractFieldErrorMessage(zodLikeError)).toBe('名前は必須です')
  })

  it('object で message が string でないなら String(error) を返す', () => {
    const error = { message: 42 }
    expect(extractFieldErrorMessage(error)).toBe(String(error))
  })

  it('object で message プロパティが無いなら String(error) を返す (fallback)', () => {
    const error = { foo: 'bar' }
    expect(extractFieldErrorMessage(error)).toBe(String(error))
  })

  it('number を渡すと String(error) を返す (fallback)', () => {
    expect(extractFieldErrorMessage(42)).toBe('42')
  })
})
