import { useCallback, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import type { Paint, PaintStock } from '~/entities/paint'
import { addPaintEvent } from '~/entities/paint'
import type { PaintPurchaseValues } from './PaintPurchaseDialog'
import type { PaintReleaseValues } from './PaintReleaseDialog'

interface UsePaintDetailInput {
  paint: Paint | null
  stock: PaintStock | null
  userId: string
}

export interface UsePaintDetailReturn {
  showPurchaseDialog: boolean
  showReleaseDialog: boolean
  setShowPurchaseDialog: (open: boolean) => void
  setShowReleaseDialog: (open: boolean) => void
  handlePurchase: (values: PaintPurchaseValues) => Promise<void>
  handleRelease: (values: PaintReleaseValues) => Promise<void>
  handleBackToList: () => void
}

export function usePaintDetail(input: UsePaintDetailInput): UsePaintDetailReturn {
  const navigate = useNavigate()
  const router = useRouter()
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)

  const { paint, userId } = input

  const handlePurchase = useCallback(
    async (values: PaintPurchaseValues) => {
      if (!paint) return
      try {
        await addPaintEvent({
          userId,
          paintId: paint.id,
          delta: 1,
          reason: 'purchase',
          purchasedAt: values.purchasedAt,
          priceYen: values.priceYen,
          purchaseLocation: values.purchaseLocation,
          note: values.note,
        })
        setShowPurchaseDialog(false)
        await router.invalidate()
      } catch (err) {
        console.warn('addPaintEvent (purchase) failed', err)
      }
    },
    [paint, userId, router],
  )

  const handleRelease = useCallback(
    async (values: PaintReleaseValues) => {
      if (!paint) return
      try {
        await addPaintEvent({
          userId,
          paintId: paint.id,
          delta: -1,
          reason: values.reason,
          note: values.note,
        })
        setShowReleaseDialog(false)
        await router.invalidate()
      } catch (err) {
        console.warn('addPaintEvent (release) failed', err)
      }
    },
    [paint, userId, router],
  )

  const handleBackToList = useCallback(() => {
    void navigate({ to: '/paints' })
  }, [navigate])

  return {
    showPurchaseDialog,
    showReleaseDialog,
    setShowPurchaseDialog,
    setShowReleaseDialog,
    handlePurchase,
    handleRelease,
    handleBackToList,
  }
}
