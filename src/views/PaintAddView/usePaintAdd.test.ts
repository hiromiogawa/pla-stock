import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestPaint } from '~/test-utils/factories/paint'
import { renderHookWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('~/features/paint-stock-add', () => ({
  addPaintEvent: vi.fn(),
}))

import { addPaintEvent } from '~/features/paint-stock-add'
import { usePaintAdd } from './usePaintAdd'

const addPaintEventMock = vi.mocked(addPaintEvent)

describe('usePaintAdd', () => {
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

  it('初期 state: phase=search', () => {
    const { result } = renderHookWithProviders(() => usePaintAdd())
    expect(result.current.phase.kind).toBe('search')
  })

  it('selectPaint で phase=add-stock に遷移', () => {
    const { result } = renderHookWithProviders(() => usePaintAdd())
    const paint = createTestPaint({ id: 'paint-1' })
    act(() => {
      result.current.selectPaint(paint)
    })
    expect(result.current.phase.kind).toBe('add-stock')
    if (result.current.phase.kind === 'add-stock') {
      expect(result.current.phase.paint.id).toBe('paint-1')
    }
  })

  it('goToSearch で phase=search に戻る', () => {
    const { result } = renderHookWithProviders(() => usePaintAdd())
    const paint = createTestPaint({ id: 'paint-1' })
    act(() => {
      result.current.selectPaint(paint)
    })
    act(() => {
      result.current.goToSearch()
    })
    expect(result.current.phase.kind).toBe('search')
  })

  it('handleStockSubmit 呼び出しで addPaintEvent が期待引数で呼ばれる', async () => {
    const { result } = renderHookWithProviders(() => usePaintAdd())

    await act(async () => {
      await result.current.handleStockSubmit('paint-1', {
        purchasedAt: '2026-05-01',
        purchasePriceYen: 220,
        purchaseLocation: 'ヨドバシ',
        note: 'シャア用',
      })
    })

    expect(addPaintEventMock).toHaveBeenCalledOnce()
    expect(addPaintEventMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paintId: 'paint-1',
        delta: 1,
        reason: 'purchase',
        purchasedAt: '2026-05-01',
        priceYen: 220,
        purchaseLocation: 'ヨドバシ',
        note: 'シャア用',
      }),
    })
  })
})
