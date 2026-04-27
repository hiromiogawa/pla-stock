import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Kit } from '~/entities/kit'
import { addKitEvent } from '~/shared/api/mock/kits'
import type { StockInput } from '~/features/kit-stock-add'
import { Button } from '~/shared/ui/button'
import { KitSearchPhase } from './KitSearchPhase'
import { KitStockForm } from './KitStockForm'

type Phase =
  | { kind: 'search' }
  | { kind: 'add-stock'; kit: Kit }

export interface KitAddViewProps {
  kits: Kit[]
  userId: string
}

export function KitAddView({ kits, userId }: KitAddViewProps) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>({ kind: 'search' })

  const handleStockSubmit = async (kitId: string, values: StockInput) => {
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
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">キットを在庫に追加</h1>
          <p className="text-sm text-muted-foreground mt-1">
            マスターから検索してキットの購入記録を追加できます。
          </p>
        </div>
        {phase.kind !== 'search' && (
          <Button variant="outline" onClick={() => setPhase({ kind: 'search' })}>
            検索に戻る
          </Button>
        )}
      </div>

      {phase.kind === 'search' && (
        <KitSearchPhase
          kits={kits}
          onSelectMaster={(kit) => setPhase({ kind: 'add-stock', kit })}
        />
      )}

      {phase.kind === 'add-stock' && (
        <KitStockForm
          kit={phase.kit}
          onSubmit={(values) => handleStockSubmit(phase.kit.id, values)}
          onCancel={() => setPhase({ kind: 'search' })}
        />
      )}
    </div>
  )
}
