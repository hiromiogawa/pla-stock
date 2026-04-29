import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Paint } from '~/entities/paint'
import { addPaintEvent } from '~/entities/paint'
import type { PaintPurchaseEventInput } from '~/features/paint-stock-add'

type Phase = { kind: 'search' } | { kind: 'add-stock'; paint: Paint }

interface UsePaintAddInput {
  userId: string
}

export interface UsePaintAddReturn {
  phase: Phase
  goToSearch: () => void
  selectPaint: (paint: Paint) => void
  handleStockSubmit: (paintId: string, values: PaintPurchaseEventInput) => Promise<void>
}

export function usePaintAdd(input: UsePaintAddInput): UsePaintAddReturn {
  const { userId } = input
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>({ kind: 'search' })

  const goToSearch = useCallback(() => {
    setPhase({ kind: 'search' })
  }, [])

  const selectPaint = useCallback((paint: Paint) => {
    setPhase({ kind: 'add-stock', paint })
  }, [])

  const handleStockSubmit = useCallback(
    async (paintId: string, values: PaintPurchaseEventInput) => {
      await addPaintEvent({
        userId,
        paintId,
        delta: 1,
        reason: 'purchase',
        purchasedAt: values.purchasedAt ?? null,
        priceYen: values.purchasePriceYen ?? null,
        purchaseLocation: values.purchaseLocation ?? null,
        note: values.note ?? null,
      })
      void navigate({
        to: '/paints/$paintId',
        params: { paintId },
      })
    },
    [userId, navigate],
  )

  return {
    phase,
    goToSearch,
    selectPaint,
    handleStockSubmit,
  }
}
