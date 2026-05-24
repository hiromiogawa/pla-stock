import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '~/test-utils/react'

vi.mock('@clerk/tanstack-react-start', () => ({
  useUser: vi.fn(),
}))

import { useUser } from '@clerk/tanstack-react-start'
import { DashboardView } from './DashboardView'

const useUserMock = vi.mocked(useUser)

const BASE_STATS = {
  kitCount: 5,
  paintCount: 12,
  buildingCount: 2,
  completedCount: 3,
  purchaseTotalYen: 12345,
}

type MockUser = { firstName: string | null; username: string | null } | null

function setUser(user: MockUser) {
  // Clerk UserResource は ~60 fields の implementation detail で、test では
  // user.firstName / user.username しか参照されない。partial mock の意図的型ミスマッチ。
  // @ts-expect-error: 上記の通り意図的に Partial UserResource を渡す
  useUserMock.mockReturnValue({ user })
}

describe('DashboardView', () => {
  beforeEach(() => {
    setUser({ firstName: 'Hiromi', username: null })
  })

  afterEach(() => {
    useUserMock.mockReset()
  })

  it('user.firstName が greeting に挿入される', () => {
    const { getByRole } = renderWithProviders(<DashboardView stats={BASE_STATS} />)
    expect(getByRole('heading', { level: 1 }).textContent).toContain('Hiromi')
  })

  it('firstName 欠 + username 在 → username が greeting に挿入', () => {
    setUser({ firstName: null, username: 'hi-user' })
    const { getByRole } = renderWithProviders(<DashboardView stats={BASE_STATS} />)
    expect(getByRole('heading', { level: 1 }).textContent).toContain('hi-user')
  })

  it('firstName/username 共に欠 → "ゲスト" fallback', () => {
    setUser({ firstName: null, username: null })
    const { getByRole } = renderWithProviders(<DashboardView stats={BASE_STATS} />)
    expect(getByRole('heading', { level: 1 }).textContent).toContain('ゲスト')
  })

  it('user が null (未ログイン) → "ゲスト" fallback', () => {
    setUser(null)
    const { getByRole } = renderWithProviders(<DashboardView stats={BASE_STATS} />)
    expect(getByRole('heading', { level: 1 }).textContent).toContain('ゲスト')
  })

  it('5 種の stats card label が全て表示される', () => {
    const { getByText } = renderWithProviders(<DashboardView stats={BASE_STATS} />)
    expect(getByText('在庫キット')).toBeTruthy()
    expect(getByText('在庫塗料')).toBeTruthy()
    expect(getByText('製作中プロジェクト')).toBeTruthy()
    expect(getByText('完成済プロジェクト')).toBeTruthy()
    expect(getByText('累計購入額')).toBeTruthy()
  })

  it.each([
    ['kitCount', 5, '個'],
    ['paintCount', 12, '本'],
    ['buildingCount', 2, '件'],
    ['completedCount', 3, '件'],
  ] as const)('%s の数値と単位が表示される (value=%s、unit=%s)', (_field, value, unit) => {
    const { getByText, getAllByText } = renderWithProviders(<DashboardView stats={BASE_STATS} />)
    expect(getByText(String(value))).toBeTruthy()
    expect(getAllByText(unit).length).toBeGreaterThan(0)
  })

  it('purchaseTotalYen=12345 が Intl で "12,345" にフォーマット (3 桁区切り)', () => {
    const { getByText } = renderWithProviders(<DashboardView stats={BASE_STATS} />)
    expect(getByText('12,345')).toBeTruthy()
  })

  it('purchaseTotalYen=0 → "0" (空文字や fallback ではない)', () => {
    const { getByText } = renderWithProviders(
      <DashboardView stats={{ ...BASE_STATS, purchaseTotalYen: 0 }} />,
    )
    expect(getByText('0')).toBeTruthy()
  })

  it('purchaseTotalYen=1234567 → "1,234,567" (大きい金額の桁区切り)', () => {
    const { getByText } = renderWithProviders(
      <DashboardView stats={{ ...BASE_STATS, purchaseTotalYen: 1_234_567 }} />,
    )
    expect(getByText('1,234,567')).toBeTruthy()
  })

  it('全 count=0 でも 5 cards 全てが描画される (空在庫 dashboard)', () => {
    const { getAllByText } = renderWithProviders(
      <DashboardView
        stats={{
          kitCount: 0,
          paintCount: 0,
          buildingCount: 0,
          completedCount: 0,
          purchaseTotalYen: 0,
        }}
      />,
    )
    // 0 が 5 cards で表示される (purchaseTotalYen は format 後も "0")
    expect(getAllByText('0').length).toBe(5)
  })
})
