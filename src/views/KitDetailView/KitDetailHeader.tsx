import type { Kit, KitStock } from '~/entities/kit'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'

export interface KitDetailHeaderProps {
  kit: Kit
  stock: KitStock
  onPurchase: () => void
  onRelease: () => void
}

export function KitDetailHeader({ kit, stock, onPurchase, onRelease }: KitDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{kit.name}</h1>
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Badge variant="outline">{kit.grade}</Badge>
          <Badge variant="outline">{kit.scale}</Badge>
          <span>·</span>
          <span>{kit.maker}</span>
          {kit.visibility === 'private' && (
            <Badge variant="outline" className="ml-1">private</Badge>
          )}
        </div>
        <p className="text-sm font-medium mt-1">在庫: {stock.count} 個</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button onClick={onPurchase}>+1 個（購入）</Button>
        <Button variant="outline" onClick={onRelease} disabled={stock.count === 0}>
          −1 個（手放し）
        </Button>
      </div>
    </div>
  )
}
