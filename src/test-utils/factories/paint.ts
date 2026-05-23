import type { Paint } from '~/entities/paint'

/**
 * テスト用 Paint factory。overrides で差分のみ指定する。
 */
export function createTestPaint(overrides: Partial<Paint> = {}): Paint {
  return {
    id: `paint-${crypto.randomUUID()}`,
    brand: 'Test Brand',
    code: 'TEST-001',
    name: 'Test Paint',
    colorFamily: '白',
    finishType: '光沢',
    swatchUrl: null,
    ...overrides,
  }
}
