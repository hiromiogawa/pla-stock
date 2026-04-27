import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Kit } from '~/entities/kit'
import { addKitStock, addPrivateKit } from '~/shared/api/mock/kits'
import type { PrivateKitInput, StockInput } from '~/features/kit-stock-add'
import { Button } from '~/shared/ui/button'
import { KitSearchPhase } from './KitSearchPhase'
import { KitStockForm } from './KitStockForm'
import { KitPrivateForm } from './KitPrivateForm'

type Phase =
  | { kind: 'search' }
  | { kind: 'add-stock'; kit: Kit }
  | { kind: 'add-private' }

export interface KitAddViewProps {
  kits: Kit[]
  userId: string
}

export function KitAddView({ kits, userId }: KitAddViewProps) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>({ kind: 'search' })

  const handleStockSubmit = async (kitId: string, values: StockInput) => {
    const newStock = await addKitStock({
      userId,
      kitId,
      purchasedAt: values.purchasedAt ?? null,
      purchasePriceYen: values.purchasePriceYen ?? null,
      purchaseLocation: values.purchaseLocation ?? null,
      remark: values.remark ?? null,
    })
    void navigate({
      to: '/app/kits/$stockId',
      params: { stockId: newStock.id },
    })
  }

  const handlePrivateSubmit = async (
    privateInput: PrivateKitInput,
    stockInput: StockInput,
  ) => {
    const newKit = await addPrivateKit({
      userId,
      name: privateInput.name,
      grade: privateInput.grade,
      scale: privateInput.scale,
      maker: privateInput.maker,
      retailPriceYen: privateInput.retailPriceYen ?? null,
    })
    const newStock = await addKitStock({
      userId,
      kitId: newKit.id,
      purchasedAt: stockInput.purchasedAt ?? null,
      purchasePriceYen: stockInput.purchasePriceYen ?? null,
      purchaseLocation: stockInput.purchaseLocation ?? null,
      remark: stockInput.remark ?? null,
    })
    void navigate({
      to: '/app/kits/$stockId',
      params: { stockId: newStock.id },
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">キットを在庫に追加</h1>
          <p className="text-sm text-muted-foreground mt-1">
            マスターから検索してキットを在庫に追加できます。マスターに無い場合は private item として登録。
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
          onCreatePrivate={() => setPhase({ kind: 'add-private' })}
        />
      )}

      {phase.kind === 'add-stock' && (
        <KitStockForm
          kit={phase.kit}
          onSubmit={(values) => handleStockSubmit(phase.kit.id, values)}
          onCancel={() => setPhase({ kind: 'search' })}
        />
      )}

      {phase.kind === 'add-private' && (
        <KitPrivateForm
          onSubmit={handlePrivateSubmit}
          onCancel={() => setPhase({ kind: 'search' })}
        />
      )}
    </div>
  )
}
