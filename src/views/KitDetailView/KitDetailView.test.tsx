import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Kit, KitEvent, KitStock } from '~/entities/kit'
import { createTestKit } from '~/test-utils/factories/kit'
import { renderWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#stub">{children}</a>,
  useNavigate: () => vi.fn(),
}))

import { KitDetailView } from './KitDetailView'

describe('KitDetailView — partial errors banner (#167)', () => {
  const kit: Kit = createTestKit({ id: 'kit-1', name: 'Test Kit' })
  const stock: KitStock = { userId: 'u-1', kitId: 'kit-1', count: 1 }
  const events: KitEvent[] = []
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
      <KitDetailView
        stock={stock}
        kit={kit}
        events={events}
        linkedProjects={[]}
        errors={{}}
        {...noopHookProps}
      />,
    )
    expect(screen.queryByText('一部データの取得に失敗しました')).toBeNull()
    // kit 名は heading に 1 件 + dialog 内にも参照あり → heading で限定して 1 件確認
    expect(screen.getByRole('heading', { level: 1, name: 'Test Kit' })).toBeTruthy()
  })

  it('errors.events あり → warning Alert 表示 + メッセージ含む', () => {
    renderWithProviders(
      <KitDetailView
        stock={stock}
        kit={kit}
        events={events}
        linkedProjects={[]}
        errors={{ events: 'D1 timeout' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText('一部データの取得に失敗しました')).toBeTruthy()
    expect(screen.getByText(/D1 timeout/)).toBeTruthy()
    // kit 表示は不変
    expect(screen.getByRole('heading', { level: 1, name: 'Test Kit' })).toBeTruthy()
  })

  it('errors.projects + errors.stock の 2 件 → 両方の error メッセージが表示', () => {
    renderWithProviders(
      <KitDetailView
        stock={stock}
        kit={kit}
        events={events}
        linkedProjects={[]}
        errors={{ projects: 'forbidden', stock: 'db locked' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText(/forbidden/)).toBeTruthy()
    expect(screen.getByText(/db locked/)).toBeTruthy()
  })

  it('kit が null → "キットが見つかりません" 画面 (errors の有無に関わらず)', () => {
    renderWithProviders(
      <KitDetailView
        stock={null}
        kit={null}
        events={[]}
        linkedProjects={[]}
        errors={{ events: 'irrelevant in not-found state' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText('キットが見つかりません')).toBeTruthy()
  })
})
