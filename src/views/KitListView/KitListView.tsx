import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Kit, KitStock } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { KitFilterBar, INITIAL_FILTERS, type KitFilters } from './KitFilterBar'
import { KitTable } from './KitTable'
import { KitCardList } from './KitCardList'

export interface KitListViewProps {
  stocks: KitStock[]
  kits: Kit[]
}

export function KitListView({ stocks, kits }: KitListViewProps) {
  const [filters, setFilters] = useState<KitFilters>(INITIAL_FILTERS)

  const kitById = useMemo(() => new Map(kits.map((k) => [k.id, k])), [kits])

  const rows = useMemo(() => {
    return stocks
      .map((stock) => {
        const kit = kitById.get(stock.kitId)
        if (!kit) return null
        return { stock, kit }
      })
      .filter((row): row is { stock: KitStock; kit: Kit } => row !== null)
      .filter(({ stock, kit }) => {
        if (filters.search && !kit.name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false
        }
        if (filters.grade !== 'all' && kit.grade !== filters.grade) return false
        if (filters.scale !== 'all' && kit.scale !== filters.scale) return false
        if (filters.assemblyStatus !== 'all' && stock.assemblyStatus !== filters.assemblyStatus) {
          return false
        }
        if (filters.maker !== 'all' && kit.maker !== filters.maker) return false
        if (filters.hasPhoto && !stock.photoUrl) return false
        return true
      })
  }, [stocks, kitById, filters])

  const makers = useMemo(() => {
    return Array.from(new Set(kits.map((k) => k.maker))).sort()
  }, [kits])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">キット</h1>
          <p className="text-sm text-muted-foreground mt-1">
            自分の在庫キット {stocks.length} 件中 {rows.length} 件を表示
          </p>
        </div>
        <Button asChild>
          <Link to="/app/kits/new">+ 追加</Link>
        </Button>
      </div>
      <KitFilterBar filters={filters} makers={makers} onChange={setFilters} />
      <div className="md:hidden">
        <KitCardList rows={rows} />
      </div>
      <div className="hidden md:block">
        <KitTable rows={rows} />
      </div>
    </div>
  )
}
