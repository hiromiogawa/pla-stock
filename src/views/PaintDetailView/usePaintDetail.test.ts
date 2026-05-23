import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestPaint } from '~/test-utils/factories/paint'
import { renderHookWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useRouter: () => ({ invalidate: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('~/features/paint-stock-add', () => ({
  addPaintEvent: vi.fn(),
}))

import { addPaintEvent } from '~/features/paint-stock-add'
import { usePaintDetail } from './usePaintDetail'

const addPaintEventMock = vi.mocked(addPaintEvent)

describe('usePaintDetail', () => {
  const paint = createTestPaint({ id: 'paint-1' })
  const stock = { userId: 'u-1', paintId: 'paint-1', count: 1 }

  beforeEach(() => {
    addPaintEventMock.mockResolvedValue({
      id: 'event-1',
      userId: 'u-1',
      paintId: 'paint-1',
      delta: 1,
      reason: 'purchase',
      purchasedAt: null,
      priceYen: null,
      purchaseLocation: null,
      note: null,
      createdAt: new Date(),
    })
  })

  afterEach(() => {
    addPaintEventMock.mockClear()
  })

  it('初期 state: 両 dialog 閉', () => {
    const { result } = renderHookWithProviders(() => usePaintDetail({ paint, stock }))
    expect(result.current.showPurchaseDialog).toBe(false)
    expect(result.current.showReleaseDialog).toBe(false)
  })

  it('setShowPurchaseDialog(true) で state が反映される', () => {
    const { result } = renderHookWithProviders(() => usePaintDetail({ paint, stock }))
    act(() => {
      result.current.setShowPurchaseDialog(true)
    })
    expect(result.current.showPurchaseDialog).toBe(true)
  })

  it('setShowReleaseDialog(true) で state が反映される', () => {
    const { result } = renderHookWithProviders(() => usePaintDetail({ paint, stock }))
    act(() => {
      result.current.setShowReleaseDialog(true)
    })
    expect(result.current.showReleaseDialog).toBe(true)
  })

  it('handlePurchase で addPaintEvent (+1 purchase) が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => usePaintDetail({ paint, stock }))

    await act(async () => {
      await result.current.handlePurchase({
        purchasedAt: '2026-05-01',
        priceYen: 220,
        purchaseLocation: null,
        note: null,
      })
    })

    expect(addPaintEventMock).toHaveBeenCalledOnce()
    expect(addPaintEventMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paintId: 'paint-1',
        delta: 1,
        reason: 'purchase',
        priceYen: 220,
      }),
    })
  })

  it('handleRelease で addPaintEvent (-1) が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => usePaintDetail({ paint, stock }))

    await act(async () => {
      await result.current.handleRelease({
        reason: 'discard',
        note: '使い切り',
      })
    })

    expect(addPaintEventMock).toHaveBeenCalledOnce()
    expect(addPaintEventMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paintId: 'paint-1',
        delta: -1,
        reason: 'discard',
        note: '使い切り',
      }),
    })
  })

  it('paint が null のとき handlePurchase / handleRelease は早期 return (addPaintEvent 呼ばれず)', async () => {
    const { result } = renderHookWithProviders(() => usePaintDetail({ paint: null, stock: null }))

    await act(async () => {
      await result.current.handlePurchase({
        purchasedAt: '2026-05-01',
        priceYen: 220,
        purchaseLocation: null,
        note: null,
      })
    })

    expect(addPaintEventMock).not.toHaveBeenCalled()
  })
})
