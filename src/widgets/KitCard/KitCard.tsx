import { Link } from '@tanstack/react-router'
import type { Kit, KitStock } from '~/entities/kit'

interface KitCardProps {
  stock: KitStock
  kit: Kit
}

export function KitCard({ stock, kit }: KitCardProps) {
  return (
    <Link to="/kits/$kitId" params={{ kitId: kit.id }} className="block">
      <div className="rounded-lg border border-border bg-card p-4 flex gap-3 items-start hover:bg-muted/30 transition-colors">
        <div className="w-16 h-16 shrink-0 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
          {kit.boxArtUrl ? (
            <img
              src={kit.boxArtUrl}
              alt={kit.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            'No Image'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{kit.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {kit.grade} · {kit.scale} · {kit.maker}
          </p>
          <div className="mt-2 flex gap-1.5 items-center">
            <span className="text-xs font-medium">在庫: {stock.count} 個</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
