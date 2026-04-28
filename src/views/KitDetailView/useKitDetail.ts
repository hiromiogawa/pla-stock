import { useCallback, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import type { Kit, KitStock } from '~/entities/kit'
import { addKitEvent } from '~/entities/kit'
import type { KitPurchaseValues } from './KitPurchaseDialog'
import type { KitReleaseValues } from './KitReleaseDialog'

interface UseKitDetailInput {
  kit: Kit | null
  stock: KitStock | null
  userId: string
}

export interface UseKitDetailReturn {
  showPurchaseDialog: boolean
  showReleaseDialog: boolean
  setShowPurchaseDialog: (open: boolean) => void
  setShowReleaseDialog: (open: boolean) => void
  handlePurchase: (values: KitPurchaseValues) => Promise<void>
  handleRelease: (values: KitReleaseValues) => Promise<void>
  handleBackToList: () => void
}

export function useKitDetail(input: UseKitDetailInput): UseKitDetailReturn {
  const navigate = useNavigate()
  const router = useRouter()
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)

  const { kit, userId } = input

  const handlePurchase = useCallback(
    async (values: KitPurchaseValues) => {
      if (!kit) return
      try {
        await addKitEvent({
          userId,
          kitId: kit.id,
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
        console.warn('addKitEvent (purchase) failed', err)
      }
    },
    [kit, userId, router],
  )

  const handleRelease = useCallback(
    async (values: KitReleaseValues) => {
      if (!kit) return
      try {
        await addKitEvent({
          userId,
          kitId: kit.id,
          delta: -1,
          reason: values.reason,
          note: values.note,
        })
        setShowReleaseDialog(false)
        await router.invalidate()
      } catch (err) {
        console.warn('addKitEvent (release) failed', err)
      }
    },
    [kit, userId, router],
  )

  const handleBackToList = useCallback(() => {
    void navigate({ to: '/kits' })
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
