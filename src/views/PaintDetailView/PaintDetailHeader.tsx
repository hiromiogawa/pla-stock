import type { Paint, PaintStock } from '~/entities/paint'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'

export interface PaintDetailHeaderProps {
  paint: Paint
  stock: PaintStock
  onPurchase: () => void
  onRelease: () => void
}

export function PaintDetailHeader({
  paint,
  stock,
  onPurchase,
  onRelease,
}: PaintDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {paint.brand} {paint.code} {paint.name}
        </h1>
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {paint.colorFamily && <Badge variant="outline">{paint.colorFamily}</Badge>}
          {paint.finishType && <Badge variant="outline">{paint.finishType}</Badge>}
        </div>
        <p className="text-sm font-medium mt-1">在庫: {stock.count} 本</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button onClick={onPurchase}>+1 本（購入）</Button>
        <Button variant="outline" onClick={onRelease} disabled={stock.count === 0}>
          −1 本（手放し）
        </Button>
      </div>
    </div>
  )
}
