import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-react-start'
import type { Kit, KitStock, KitEvent } from '~/entities/kit'
import type { Project } from '~/entities/project'
import { addKitEvent } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { KitDetailHeader } from './KitDetailHeader'
import { KitDetailFields } from './KitDetailFields'
import { KitPurchaseDialog, type KitPurchaseValues } from './KitPurchaseDialog'
import { KitReleaseDialog, type KitReleaseValues } from './KitReleaseDialog'
import { LinkedProjects } from './LinkedProjects'

interface KitDetailViewProps {
  stock: KitStock | null
  kit: Kit | null
  events: KitEvent[]
  linkedProjects: Project[]
}

export function KitDetailView({
  stock: initialStock,
  kit,
  events: initialEvents,
  linkedProjects,
}: KitDetailViewProps) {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [currentStock, setCurrentStock] = useState(initialStock)
  const [currentEvents, setCurrentEvents] = useState(initialEvents)

  if (!currentStock || !kit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 md:px-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">キットが見つかりません</h1>
        <p className="text-sm text-muted-foreground">
          指定された kitId のキットは存在しないか、在庫がありません。
        </p>
        <Button onClick={() => navigate({ to: '/kits' })}>キット一覧へ戻る</Button>
      </div>
    )
  }

  const handlePurchase = async (values: KitPurchaseValues) => {
    if (!userId) return
    try {
      const newEvent = await addKitEvent({
        userId,
        kitId: kit.id,
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
      console.warn('addKitEvent (purchase) failed', err)
    }
  }

  const handleRelease = async (values: KitReleaseValues) => {
    if (!userId) return
    try {
      const newEvent = await addKitEvent({
        userId,
        kitId: kit.id,
        delta: -1,
        reason: values.reason,
        note: values.note,
      })
      setCurrentStock({ ...currentStock, count: currentStock.count - 1 })
      setCurrentEvents([newEvent, ...currentEvents])
    } catch (err) {
      console.warn('addKitEvent (release) failed', err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <KitDetailHeader
        kit={kit}
        stock={currentStock}
        onPurchase={() => setShowPurchaseDialog(true)}
        onRelease={() => setShowReleaseDialog(true)}
      />
      <KitDetailFields stock={currentStock} kit={kit} events={currentEvents} />
      <LinkedProjects projects={linkedProjects} />
      <KitPurchaseDialog
        open={showPurchaseDialog}
        kitName={kit.name}
        onOpenChange={setShowPurchaseDialog}
        onConfirm={handlePurchase}
      />
      <KitReleaseDialog
        open={showReleaseDialog}
        kitName={kit.name}
        onOpenChange={setShowReleaseDialog}
        onConfirm={handleRelease}
      />
    </div>
  )
}
