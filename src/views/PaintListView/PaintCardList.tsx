import type { Paint, PaintStock } from '~/entities/paint'
import { PaintSwatchCard } from '~/widgets/PaintSwatchCard'

export interface PaintCardListProps {
  rows: Array<{ stock: PaintStock; paint: Paint }>
}

export function PaintCardList({ rows }: PaintCardListProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
        該当する塗料がありません
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {rows.map(({ stock, paint }) => (
        <PaintSwatchCard key={paint.id} stock={stock} paint={paint} />
      ))}
    </div>
  )
}
