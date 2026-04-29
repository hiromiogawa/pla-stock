import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSnackbar } from 'notistack'
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

/**
 * PaintAddView 用の Hook (Container/Hook/Presenter パターン)。
 *
 * 担当する state / 副作用:
 * - Phase state: 'search' (paint master 検索中) / 'add-stock' (paint 選択後、購入記録入力中)
 * - 検索フェーズへ戻る (goToSearch)
 * - master paint 選択 (selectPaint) → 'add-stock' phase へ遷移
 * - 購入記録: addPaintEvent({ delta: +1, reason: 'purchase' }) → paint_stock.count += 1
 * - 成功時は Snackbar (notistack) で success 通知 + /paints/:paintId (詳細) へ navigation
 *
 * View (Presenter) は本 Hook の戻り値をそのまま props として受け取り、
 * useState / 副作用は持たない (#43 ルール)。
 */
export function usePaintAdd(input: UsePaintAddInput): UsePaintAddReturn {
  const { userId } = input
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
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
      enqueueSnackbar('塗料を在庫に追加しました', { variant: 'success' })
      void navigate({
        to: '/paints/$paintId',
        params: { paintId },
      })
    },
    [userId, navigate, enqueueSnackbar],
  )

  return {
    phase,
    goToSearch,
    selectPaint,
    handleStockSubmit,
  }
}
