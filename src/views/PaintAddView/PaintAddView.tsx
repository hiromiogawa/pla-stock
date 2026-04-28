import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Paint } from '~/entities/paint'
import { addPaintEvent } from '~/entities/paint'
import type { PaintPurchaseEventInput } from '~/features/paint-stock-add'
import { Button } from '~/shared/ui/button'
import { PaintSearchPhase } from './PaintSearchPhase'
import { PaintStockForm } from './PaintStockForm'

type Phase = { kind: 'search' } | { kind: 'add-stock'; paint: Paint }

interface PaintAddViewProps {
  paints: Paint[]
  userId: string
}

export function PaintAddView({ paints, userId }: PaintAddViewProps) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>({ kind: 'search' })

  const handleStockSubmit = async (paintId: string, values: PaintPurchaseEventInput) => {
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
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">塗料を在庫に追加</h1>
          <p className="text-sm text-muted-foreground mt-1">
            マスターから検索して塗料の購入記録を追加できます。
          </p>
        </div>
        {phase.kind !== 'search' && (
          <Button variant="outline" onClick={() => setPhase({ kind: 'search' })}>
            検索に戻る
          </Button>
        )}
      </div>

      {phase.kind === 'search' && (
        <PaintSearchPhase
          paints={paints}
          onSelectMaster={(paint) => setPhase({ kind: 'add-stock', paint })}
        />
      )}

      {phase.kind === 'add-stock' && (
        <PaintStockForm
          paint={phase.paint}
          onSubmit={(values) => handleStockSubmit(phase.paint.id, values)}
          onCancel={() => setPhase({ kind: 'search' })}
        />
      )}
    </div>
  )
}
