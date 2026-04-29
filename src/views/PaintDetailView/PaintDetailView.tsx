import type { Paint, PaintStock, PaintEvent } from '~/entities/paint'
import type { Project } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { PaintDetailHeader } from './PaintDetailHeader'
import { PaintDetailFields } from './PaintDetailFields'
import { PaintPurchaseDialog } from './PaintPurchaseDialog'
import { PaintReleaseDialog } from './PaintReleaseDialog'
import { LinkedProjectsForPaint } from './LinkedProjectsForPaint'
import type { UsePaintDetailReturn } from './usePaintDetail'

interface PaintDetailViewProps extends UsePaintDetailReturn {
  stock: PaintStock | null
  paint: Paint | null
  events: PaintEvent[]
  linkedProjects: Project[]
}

export function PaintDetailView({
  stock,
  paint,
  events,
  linkedProjects,
  showPurchaseDialog,
  showReleaseDialog,
  setShowPurchaseDialog,
  setShowReleaseDialog,
  handlePurchase,
  handleRelease,
  handleBackToList,
}: PaintDetailViewProps) {
  if (!stock || !paint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 md:px-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">塗料が見つかりません</h1>
        <p className="text-sm text-muted-foreground">
          指定された paintId の塗料は存在しないか、在庫がありません。
        </p>
        <Button onClick={handleBackToList}>塗料一覧へ戻る</Button>
      </div>
    )
  }

  const paintLabel = `${paint.brand} ${paint.code} ${paint.name}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <PaintDetailHeader
        paint={paint}
        stock={stock}
        onPurchase={() => setShowPurchaseDialog(true)}
        onRelease={() => setShowReleaseDialog(true)}
      />
      <PaintDetailFields stock={stock} paint={paint} events={events} />
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
