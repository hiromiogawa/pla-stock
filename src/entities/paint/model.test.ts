import { describe, expect, it } from 'vitest'
import { KIT_EVENT_REASON_LABELS } from '~/entities/kit'
import { PAINT_EVENT_REASON_LABELS } from './model'
import { COLOR_FAMILY_VALUES, FINISH_TYPE_VALUES, PAINT_EVENT_REASONS } from './schema'

describe('PAINT_EVENT_REASON_LABELS', () => {
  it('全 PAINT_EVENT_REASONS に対応 label が存在 (exhaustiveness)', () => {
    const keys = Object.keys(PAINT_EVENT_REASON_LABELS).sort()
    const reasons = [...PAINT_EVENT_REASONS].sort()
    expect(keys).toEqual(reasons)
  })

  it.each(
    PAINT_EVENT_REASONS.map((reason) => [reason]),
  )('reason=%s の label が想定の日本語と一致 (regression 防御)', (reason) => {
    const expected: Record<typeof reason, string> = {
      purchase: '購入',
      gift: '譲渡',
      sell: '売却',
      discard: '廃棄（使い切り）',
      lost: '紛失',
      other: 'その他',
    }
    expect(PAINT_EVENT_REASON_LABELS[reason]).toBe(expected[reason])
  })

  it('全 label が non-empty', () => {
    for (const label of Object.values(PAINT_EVENT_REASON_LABELS)) {
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('全 label が前後 whitespace なし (trim 済)', () => {
    for (const label of Object.values(PAINT_EVENT_REASON_LABELS)) {
      expect(label).toBe(label.trim())
    }
  })

  it('label に重複なし (UX 観点: 異なる reason が同 label に潰れない)', () => {
    const labels = Object.values(PAINT_EVENT_REASON_LABELS)
    const unique = new Set(labels)
    expect(unique.size).toBe(labels.length)
  })

  it('paint.discard は kit.discard と異なる文言 (使い切り vs 廃棄、本 entity 固有の差別化)', () => {
    expect(PAINT_EVENT_REASON_LABELS.discard).toBe('廃棄（使い切り）')
    expect(KIT_EVENT_REASON_LABELS.discard).toBe('廃棄')
    expect(PAINT_EVENT_REASON_LABELS.discard).not.toBe(KIT_EVENT_REASON_LABELS.discard)
  })
})

describe('COLOR_FAMILY_VALUES', () => {
  it('12 色 family の閉集合を保持 (UI Select の選択肢源、追加削除時は破壊的)', () => {
    expect([...COLOR_FAMILY_VALUES].sort()).toEqual(
      ['other', 'クリア', '蛍光', '金', '茶', '銀', '黄', '緑', '白', '青', '赤', '黒'].sort(),
    )
  })

  it('"other" を含む (未分類 fallback、UI で必須)', () => {
    expect(COLOR_FAMILY_VALUES).toContain('other')
  })

  it('値の重複なし', () => {
    const unique = new Set(COLOR_FAMILY_VALUES)
    expect(unique.size).toBe(COLOR_FAMILY_VALUES.length)
  })
})

describe('FINISH_TYPE_VALUES', () => {
  it('仕上げ種別の閉集合を保持', () => {
    expect([...FINISH_TYPE_VALUES].sort()).toEqual(
      [
        'ウェザリング',
        'クリア',
        'パール',
        'プライマー',
        'メタリック',
        'つや消し',
        '光沢',
        '半光沢',
      ].sort(),
    )
  })

  it('値の重複なし', () => {
    const unique = new Set(FINISH_TYPE_VALUES)
    expect(unique.size).toBe(FINISH_TYPE_VALUES.length)
  })
})
