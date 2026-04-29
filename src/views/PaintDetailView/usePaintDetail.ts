import { useCallback, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
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

/**
 * PaintDetailView 用の Hook (Container/Hook/Presenter パターン)。
 *
 * 担当する state / 副作用:
 * - 購入ダイアログ / 出庫ダイアログの表示状態 (useState ×2)
 * - 購入記録: addPaintEvent({ delta: +1, reason: 'purchase' })
 * - 出庫記録: addPaintEvent({ delta: -1, reason: <release reason> })
 * - mutation 後は router.invalidate() で loader 再実行 → 最新 stock/events を再取得
 * - 一覧へ戻る navigation
 * - mutation 失敗時は Snackbar (notistack) で error 通知
 * - mutation 成功時は Snackbar (notistack) で success 通知
 *
 * View (Presenter) は本 Hook の戻り値をそのまま props として受け取り、
 * useState / 副作用は持たない (#43 ルール)。
 */
export function usePaintDetail(input: UsePaintDetailInput): UsePaintDetailReturn {
  const navigate = useNavigate()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
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
        enqueueSnackbar('塗料の購入記録を追加しました', { variant: 'success' })
      } catch (err) {
        enqueueSnackbar(
          `塗料の購入記録に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
          { variant: 'error' },
        )
      }
    },
    [paint, userId, router, enqueueSnackbar],
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
        enqueueSnackbar('塗料の出庫記録を追加しました', { variant: 'success' })
      } catch (err) {
        enqueueSnackbar(
          `塗料の出庫記録に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
          { variant: 'error' },
        )
      }
    },
    [paint, userId, router, enqueueSnackbar],
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
