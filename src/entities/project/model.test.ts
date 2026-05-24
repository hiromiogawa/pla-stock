import { describe, expect, it } from 'vitest'
import { PROJECT_STATUS_LABEL } from './model'
import { PROJECT_STATUS_VALUES } from './schema'

describe('PROJECT_STATUS_LABEL', () => {
  it('全 PROJECT_STATUS_VALUES に対応 label が存在 (exhaustiveness)', () => {
    const keys = Object.keys(PROJECT_STATUS_LABEL).sort()
    const statuses = [...PROJECT_STATUS_VALUES].sort()
    expect(keys).toEqual(statuses)
  })

  it.each(
    PROJECT_STATUS_VALUES.map((status) => [status]),
  )('status=%s の label が想定の日本語と一致 (regression 防御)', (status) => {
    const expected: Record<typeof status, string> = {
      planning: '計画中',
      building: '製作中',
      completed: '完成',
      abandoned: '頓挫',
    }
    expect(PROJECT_STATUS_LABEL[status]).toBe(expected[status])
  })

  it('全 label が non-empty', () => {
    for (const label of Object.values(PROJECT_STATUS_LABEL)) {
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('全 label が前後 whitespace なし (trim 済)', () => {
    for (const label of Object.values(PROJECT_STATUS_LABEL)) {
      expect(label).toBe(label.trim())
    }
  })

  it('label に重複なし (UX 観点)', () => {
    const labels = Object.values(PROJECT_STATUS_LABEL)
    const unique = new Set(labels)
    expect(unique.size).toBe(labels.length)
  })
})
