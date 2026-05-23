import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestKit } from '~/test-utils/factories/kit'
import { renderHookWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useRouter: () => ({ invalidate: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('~/features/kit-stock-add', () => ({
  addKitEvent: vi.fn(),
}))

import { addKitEvent } from '~/features/kit-stock-add'
import { useKitDetail } from './useKitDetail'

const addKitEventMock = vi.mocked(addKitEvent)

describe('useKitDetail', () => {
  const kit = createTestKit({ id: 'kit-1' })
  const stock = { userId: 'u-1', kitId: 'kit-1', count: 1 }

  beforeEach(() => {
    addKitEventMock.mockResolvedValue({
      id: 'event-1',
      userId: 'u-1',
      kitId: 'kit-1',
      delta: 1,
      reason: 'purchase',
      projectId: null,
      purchasedAt: null,
      priceYen: null,
      purchaseLocation: null,
      note: null,
      createdAt: new Date(),
    })
  })

  afterEach(() => {
    addKitEventMock.mockClear()
  })

  it('初期 state: 両 dialog 閉', () => {
    const { result } = renderHookWithProviders(() => useKitDetail({ kit, stock }))
    expect(result.current.showPurchaseDialog).toBe(false)
    expect(result.current.showReleaseDialog).toBe(false)
  })

  it('setShowPurchaseDialog(true) で state が反映される', () => {
    const { result } = renderHookWithProviders(() => useKitDetail({ kit, stock }))
    act(() => {
      result.current.setShowPurchaseDialog(true)
    })
    expect(result.current.showPurchaseDialog).toBe(true)
  })

  it('handlePurchase 呼び出しで addKitEvent が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => useKitDetail({ kit, stock }))

    await act(async () => {
      await result.current.handlePurchase({
        purchasedAt: '2026-05-01',
        priceYen: 1500,
        purchaseLocation: null,
        note: null,
      })
    })

    expect(addKitEventMock).toHaveBeenCalledOnce()
    expect(addKitEventMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        kitId: 'kit-1',
        delta: 1,
        reason: 'purchase',
        priceYen: 1500,
        purchasedAt: '2026-05-01',
      }),
    })
  })
})
