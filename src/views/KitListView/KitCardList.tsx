import type { Kit, KitStock } from '~/entities/kit'
import { KitCard } from '~/widgets/KitCard'

export interface KitCardListProps {
  rows: Array<{ stock: KitStock; kit: Kit }>
}

export function KitCardList({ rows }: KitCardListProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
        該当するキットがありません
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {rows.map(({ stock, kit }) => (
        <KitCard key={stock.id} stock={stock} kit={kit} />
      ))}
    </div>
  )
}
