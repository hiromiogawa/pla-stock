import { describe, expect, it } from 'vitest'
import { KIT_EVENT_REASON_LABELS } from './model'
import { KIT_EVENT_REASONS } from './schema'

describe('KIT_EVENT_REASON_LABELS', () => {
  it('全 KIT_EVENT_REASONS に対応 label が存在 (exhaustiveness)', () => {
    const keys = Object.keys(KIT_EVENT_REASON_LABELS).sort()
    const reasons = [...KIT_EVENT_REASONS].sort()
    expect(keys).toEqual(reasons)
  })

  it.each(
    KIT_EVENT_REASONS.map((reason) => [reason]),
  )('reason=%s の label が想定の日本語と一致 (regression 防御)', (reason) => {
    const expected: Record<typeof reason, string> = {
      purchase: '購入',
      project: 'プロジェクト',
      gift: '譲渡',
      sell: '売却',
      discard: '廃棄',
      other: 'その他',
    }
    expect(KIT_EVENT_REASON_LABELS[reason]).toBe(expected[reason])
  })

  it('全 label が non-empty', () => {
    for (const label of Object.values(KIT_EVENT_REASON_LABELS)) {
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('全 label が前後 whitespace なし (trim 済)', () => {
    for (const label of Object.values(KIT_EVENT_REASON_LABELS)) {
      expect(label).toBe(label.trim())
    }
  })

  it('label に重複なし (UX 観点: 異なる reason が同 label に潰れない)', () => {
    const labels = Object.values(KIT_EVENT_REASON_LABELS)
    const unique = new Set(labels)
    expect(unique.size).toBe(labels.length)
  })
})
