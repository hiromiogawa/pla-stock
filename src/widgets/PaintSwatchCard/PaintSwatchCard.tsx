import type { Paint, PaintStock } from '~/entities/paint'
import { Badge } from '~/shared/ui/badge'

export interface PaintSwatchCardProps {
  stock: PaintStock
  paint: Paint
}

const STATUS_LABEL: Record<PaintStock['status'], string> = {
  new: '新品',
  in_use: '使用中',
  empty: '空',
}

const STATUS_VARIANT: Record<
  PaintStock['status'],
  'default' | 'secondary' | 'outline'
> = {
  new: 'default',
  in_use: 'secondary',
  empty: 'outline',
}

export function PaintSwatchCard({ stock, paint }: PaintSwatchCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex gap-3 items-start">
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
          <Badge variant={STATUS_VARIANT[stock.status]} className="text-xs">
            {STATUS_LABEL[stock.status]}
          </Badge>
          {paint.visibility === 'private' && (
            <Badge variant="outline" className="text-xs">
              private
            </Badge>
          )}
        </div>
        {stock.remark && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {stock.remark}
          </p>
        )}
      </div>
    </div>
  )
}
