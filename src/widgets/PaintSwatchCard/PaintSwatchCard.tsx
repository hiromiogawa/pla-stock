import { Link } from '@tanstack/react-router'
import type { Paint, PaintStock } from '~/entities/paint'

interface PaintSwatchCardProps {
  stock: PaintStock
  paint: Paint
}

export function PaintSwatchCard({ stock, paint }: PaintSwatchCardProps) {
  return (
    <Link to="/paints/$paintId" params={{ paintId: paint.id }} className="block">
      <div className="rounded-lg border border-border bg-card p-4 flex gap-3 items-start hover:bg-muted/30 transition-colors">
        <div className="w-12 h-12 shrink-0 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
          {paint.swatchUrl ? (
            <img
              src={paint.swatchUrl}
              alt={paint.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            'No Swatch'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">
            {paint.brand} {paint.code} {paint.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {paint.colorFamily ?? '色系統 未設定'} · {paint.finishType ?? 'フィニッシュ 未設定'}
          </p>
          <div className="mt-2 flex gap-1.5 items-center">
            <span className="text-xs font-medium">在庫: {stock.count} 本</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
