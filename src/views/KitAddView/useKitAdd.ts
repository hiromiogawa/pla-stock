import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Kit } from '~/entities/kit'
import { addKitEvent } from '~/entities/kit'
import type { PurchaseEventInput } from '~/features/kit-stock-add'

type Phase = { kind: 'search' } | { kind: 'add-stock'; kit: Kit }

interface UseKitAddInput {
  userId: string
}

export interface UseKitAddReturn {
  phase: Phase
  goToSearch: () => void
  selectKit: (kit: Kit) => void
  handleStockSubmit: (kitId: string, values: PurchaseEventInput) => Promise<void>
}

/**
 * KitAddView 用の Hook (Container/Hook/Presenter パターン)。
 *
 * 担当する state / 副作用:
 * - Phase state: 'search' (kit master 検索中) / 'add-stock' (kit 選択後、購入記録入力中)
 * - 検索フェーズへ戻る (goToSearch)
 * - master kit 選択 (selectKit) → 'add-stock' phase へ遷移
 * - 購入記録: addKitEvent({ delta: +1, reason: 'purchase' }) → kit_stock.count += 1
 * - 成功時は /kits/:kitId (詳細) へ navigation
 *
 * View (Presenter) は本 Hook の戻り値をそのまま props として受け取り、
 * useState / 副作用は持たない (#43 ルール)。
 */
export function useKitAdd(input: UseKitAddInput): UseKitAddReturn {
  const { userId } = input
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>({ kind: 'search' })

  const goToSearch = useCallback(() => {
    setPhase({ kind: 'search' })
  }, [])

  const selectKit = useCallback((kit: Kit) => {
    setPhase({ kind: 'add-stock', kit })
  }, [])

  const handleStockSubmit = useCallback(
    async (kitId: string, values: PurchaseEventInput) => {
      // 購入イベント (+1) を作成 → kit_stock.count += 1 (自動作成あり)
      await addKitEvent({
        userId,
        kitId,
        delta: 1,
        reason: 'purchase',
        purchasedAt: values.purchasedAt ?? null,
        priceYen: values.purchasePriceYen ?? null,
        purchaseLocation: values.purchaseLocation ?? null,
        note: values.note ?? null,
      })
      void navigate({
        to: '/kits/$kitId',
        params: { kitId },
      })
    },
    [userId, navigate],
  )

  return {
    phase,
    goToSearch,
    selectKit,
    handleStockSubmit,
  }
}
