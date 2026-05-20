import { useCallback, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
import type { Kit, KitStock } from '~/entities/kit'
import { addKitEvent } from '~/features/kit-stock-add'
import type { KitPurchaseValues } from './KitPurchaseDialog'
import type { KitReleaseValues } from './KitReleaseDialog'

interface UseKitDetailInput {
  kit: Kit | null
  stock: KitStock | null
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

/**
 * KitDetailView 用の Hook (Container/Hook/Presenter パターン)。
 *
 * 担当する state / 副作用:
 * - 購入ダイアログ / 出庫ダイアログの表示状態 (useState ×2)
 * - 購入記録: addKitEvent({ data: { delta: +1, reason: 'purchase' } })
 * - 出庫記録: addKitEvent({ data: { delta: -1, reason: <release reason> } })
 *   (userId は server fn 内 auth() 由来、client 入力なし = IDOR 防止)
 * - mutation 後は router.invalidate() で loader 再実行 → 最新 stock/events を再取得
 * - 一覧へ戻る navigation
 * - mutation 失敗時は Snackbar (notistack) で error 通知
 * - mutation 成功時は Snackbar (notistack) で success 通知
 *
 * View (Presenter) は本 Hook の戻り値をそのまま props として受け取り、
 * useState / 副作用は持たない (#43 ルール)。
 */
export function useKitDetail(input: UseKitDetailInput): UseKitDetailReturn {
  const navigate = useNavigate()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)

  const { kit } = input

  const handlePurchase = useCallback(
    async (values: KitPurchaseValues) => {
      if (!kit) return
      try {
        await addKitEvent({
          data: {
            kitId: kit.id,
            delta: 1,
            reason: 'purchase',
            purchasedAt: values.purchasedAt,
            priceYen: values.priceYen,
            purchaseLocation: values.purchaseLocation,
            note: values.note,
          },
        })
        setShowPurchaseDialog(false)
        await router.invalidate()
        enqueueSnackbar('キットの購入記録を追加しました', { variant: 'success' })
      } catch (err) {
        enqueueSnackbar(
          `キットの購入記録に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
          { variant: 'error' },
        )
      }
    },
    [kit, router, enqueueSnackbar],
  )

  const handleRelease = useCallback(
    async (values: KitReleaseValues) => {
      if (!kit) return
      try {
        await addKitEvent({
          data: {
            kitId: kit.id,
            delta: -1,
            reason: values.reason,
            note: values.note,
          },
        })
        setShowReleaseDialog(false)
        await router.invalidate()
        enqueueSnackbar('キットの出庫記録を追加しました', { variant: 'success' })
      } catch (err) {
        enqueueSnackbar(
          `キットの出庫記録に失敗しました: ${err instanceof Error ? err.message : String(err)}`,
          { variant: 'error' },
        )
      }
    },
    [kit, router, enqueueSnackbar],
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
