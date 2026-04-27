import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-react-start'
import type { Paint, PaintStock, PaintEvent } from '~/entities/paint'
import type { Project } from '~/entities/project'
import { addPaintEvent } from '~/shared/api/mock/paints'
import { Button } from '~/shared/ui/button'
import { PaintDetailHeader } from './PaintDetailHeader'
import { PaintDetailFields } from './PaintDetailFields'
import { PaintPurchaseDialog, type PaintPurchaseValues } from './PaintPurchaseDialog'
import { PaintReleaseDialog, type PaintReleaseValues } from './PaintReleaseDialog'
import { LinkedProjectsForPaint } from './LinkedProjectsForPaint'

export interface PaintDetailViewProps {
  stock: PaintStock | null
  paint: Paint | null
  events: PaintEvent[]
  linkedProjects: Project[]
}

export function PaintDetailView({ stock: initialStock, paint, events: initialEvents, linkedProjects }: PaintDetailViewProps) {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [currentStock, setCurrentStock] = useState(initialStock)
  const [currentEvents, setCurrentEvents] = useState(initialEvents)

  if (!currentStock || !paint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 md:px-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">塗料が見つかりません</h1>
        <p className="text-sm text-muted-foreground">
          指定された paintId の塗料は存在しないか、在庫がありません。
        </p>
        <Button onClick={() => navigate({ to: '/paints' })}>塗料一覧へ戻る</Button>
      </div>
    )
  }

  const paintLabel = `${paint.brand} ${paint.code} ${paint.name}`

  const handlePurchase = async (values: PaintPurchaseValues) => {
    if (!userId) return
    try {
      const newEvent = await addPaintEvent({
        userId,
        paintId: paint.id,
        delta: 1,
        reason: 'purchase',
        purchasedAt: values.purchasedAt,
        priceYen: values.priceYen,
        purchaseLocation: values.purchaseLocation,
        note: values.note,
      })
      setCurrentStock({ ...currentStock, count: currentStock.count + 1 })
      setCurrentEvents([newEvent, ...currentEvents])
    } catch (err) {
      console.warn('addPaintEvent (purchase) failed', err)
    }
  }

  const handleRelease = async (values: PaintReleaseValues) => {
    if (!userId) return
    try {
      const newEvent = await addPaintEvent({
        userId,
        paintId: paint.id,
        delta: -1,
        reason: values.reason,
        note: values.note,
      })
      setCurrentStock({ ...currentStock, count: currentStock.count - 1 })
      setCurrentEvents([newEvent, ...currentEvents])
    } catch (err) {
      console.warn('addPaintEvent (release) failed', err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <PaintDetailHeader
        paint={paint}
        stock={currentStock}
        onPurchase={() => setShowPurchaseDialog(true)}
        onRelease={() => setShowReleaseDialog(true)}
      />
      <PaintDetailFields stock={currentStock} paint={paint} events={currentEvents} />
      <LinkedProjectsForPaint projects={linkedProjects} />
      <PaintPurchaseDialog
        open={showPurchaseDialog}
        paintLabel={paintLabel}
        onOpenChange={setShowPurchaseDialog}
        onConfirm={handlePurchase}
      />
      <PaintReleaseDialog
        open={showReleaseDialog}
        paintLabel={paintLabel}
        onOpenChange={setShowReleaseDialog}
        onConfirm={handleRelease}
      />
    </div>
  )
}
