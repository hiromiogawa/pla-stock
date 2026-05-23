import type { Kit } from '~/entities/kit'

/**
 * テスト用 Kit factory。overrides で差分のみ指定する。
 * 全フィールドの妥当なデフォルトを提供し、テストごとに必要な箇所だけ書き換える。
 */
export function createTestKit(overrides: Partial<Kit> = {}): Kit {
  return {
    id: `kit-${crypto.randomUUID()}`,
    name: 'Test Kit',
    grade: 'HG',
    scale: '1/144',
    retailPriceYen: null,
    boxArtUrl: null,
    ...overrides,
  }
}
