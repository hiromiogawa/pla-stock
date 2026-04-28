import type { Kit, KitStock, KitEvent } from '~/entities/kit'
import type { Project } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { KitDetailHeader } from './KitDetailHeader'
import { KitDetailFields } from './KitDetailFields'
import { KitPurchaseDialog } from './KitPurchaseDialog'
import { KitReleaseDialog } from './KitReleaseDialog'
import { LinkedProjects } from './LinkedProjects'
import type { UseKitDetailReturn } from './useKitDetail'

interface KitDetailViewProps extends UseKitDetailReturn {
  stock: KitStock | null
  kit: Kit | null
  events: KitEvent[]
  linkedProjects: Project[]
}

export function KitDetailView({
  stock,
  kit,
  events,
  linkedProjects,
  showPurchaseDialog,
  showReleaseDialog,
  setShowPurchaseDialog,
  setShowReleaseDialog,
  handlePurchase,
  handleRelease,
  handleBackToList,
}: KitDetailViewProps) {
  if (!stock || !kit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 md:px-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">キットが見つかりません</h1>
        <p className="text-sm text-muted-foreground">
          指定された kitId のキットは存在しないか、在庫がありません。
        </p>
        <Button onClick={handleBackToList}>キット一覧へ戻る</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <KitDetailHeader
        kit={kit}
        stock={stock}
        onPurchase={() => setShowPurchaseDialog(true)}
        onRelease={() => setShowReleaseDialog(true)}
      />
      <KitDetailFields stock={stock} kit={kit} events={events} />
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
