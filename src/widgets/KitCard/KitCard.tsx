import type { Kit, KitStock } from '~/entities/kit'
import { Badge } from '~/shared/ui/badge'

export interface KitCardProps {
  stock: KitStock
  kit: Kit
}

const ASSEMBLY_LABEL: Record<KitStock['assemblyStatus'], string> = {
  unbuilt: '未組立',
  building: '組立中',
  completed: '完成',
}

const ASSEMBLY_VARIANT: Record<KitStock['assemblyStatus'], 'default' | 'secondary' | 'outline'> = {
  unbuilt: 'outline',
  building: 'secondary',
  completed: 'default',
}

export function KitCard({ stock, kit }: KitCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex gap-3 items-start">
      <div className="w-16 h-16 shrink-0 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
        {kit.boxArtUrl ? (
          <img src={kit.boxArtUrl} alt={kit.name} className="w-full h-full object-cover rounded" />
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
          <Badge variant={ASSEMBLY_VARIANT[stock.assemblyStatus]} className="text-xs">
            {ASSEMBLY_LABEL[stock.assemblyStatus]}
          </Badge>
          {kit.visibility === 'private' && (
            <Badge variant="outline" className="text-xs">private</Badge>
          )}
        </div>
        {stock.remark && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{stock.remark}</p>
        )}
      </div>
    </div>
  )
}
