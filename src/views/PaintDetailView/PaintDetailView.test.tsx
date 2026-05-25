import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Paint, PaintEvent, PaintStock } from '~/entities/paint'
import { createTestPaint } from '~/test-utils/factories/paint'
import { renderWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#stub">{children}</a>,
  useNavigate: () => vi.fn(),
}))

import { PaintDetailView } from './PaintDetailView'

describe('PaintDetailView — partial errors banner (#167)', () => {
  const paint: Paint = createTestPaint({
    id: 'paint-1',
    name: 'Pure White',
    brand: 'GSI',
    code: 'C001',
  })
  const stock: PaintStock = { userId: 'u-1', paintId: 'paint-1', count: 2 }
  const events: PaintEvent[] = []
  const noopHookProps = {
    showPurchaseDialog: false,
    showReleaseDialog: false,
    setShowPurchaseDialog: vi.fn(),
    setShowReleaseDialog: vi.fn(),
    handlePurchase: vi.fn(),
    handleRelease: vi.fn(),
    handleBackToList: vi.fn(),
  }

  it('errors 空 → 部分失敗 Alert は表示されない (通常画面)', () => {
    renderWithProviders(
      <PaintDetailView
        stock={stock}
        paint={paint}
        events={events}
        linkedProjects={[]}
        errors={{}}
        {...noopHookProps}
      />,
    )
    expect(screen.queryByText('一部データの取得に失敗しました')).toBeNull()
    // paint.name は heading に表示
    expect(screen.getByRole('heading', { level: 1, name: 'Pure White' })).toBeTruthy()
  })

  it('errors.events あり → warning Alert 表示 + メッセージ含む', () => {
    renderWithProviders(
      <PaintDetailView
        stock={stock}
        paint={paint}
        events={events}
        linkedProjects={[]}
        errors={{ events: 'D1 timeout' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText('一部データの取得に失敗しました')).toBeTruthy()
    expect(screen.getByText(/D1 timeout/)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Pure White' })).toBeTruthy()
  })

  it('errors.projects + errors.stock の 2 件 → 両方の error メッセージが表示', () => {
    renderWithProviders(
      <PaintDetailView
        stock={stock}
        paint={paint}
        events={events}
        linkedProjects={[]}
        errors={{ projects: 'forbidden', stock: 'db locked' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText(/forbidden/)).toBeTruthy()
    expect(screen.getByText(/db locked/)).toBeTruthy()
  })

  it('paint が null → "塗料が見つかりません" 画面 (errors の有無に関わらず)', () => {
    renderWithProviders(
      <PaintDetailView
        stock={null}
        paint={null}
        events={[]}
        linkedProjects={[]}
        errors={{ events: 'irrelevant in not-found state' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText('塗料が見つかりません')).toBeTruthy()
  })
})
