import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Paint, PaintStock } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { PaintFilterBar, INITIAL_FILTERS, type PaintFilters } from './PaintFilterBar'
import { PaintTable } from './PaintTable'
import { PaintCardList } from './PaintCardList'

interface PaintListViewProps {
  /** count > 0 の paint_stock のみ渡す (ローダー側で絞り込み済み) */
  stocks: PaintStock[]
  paints: Paint[]
}

export function PaintListView({ stocks, paints }: PaintListViewProps) {
  const [filters, setFilters] = useState<PaintFilters>(INITIAL_FILTERS)

  const paintById = useMemo(() => new Map(paints.map((p) => [p.id, p])), [paints])

  const rows = useMemo(() => {
    return stocks
      .map((stock) => {
        const paint = paintById.get(stock.paintId)
        if (!paint) return null
        return { stock, paint }
      })
      .filter((row): row is { stock: PaintStock; paint: Paint } => row !== null)
      .filter(({ paint }) => {
        if (filters.search) {
          const q = filters.search.toLowerCase()
          const matches =
            paint.name.toLowerCase().includes(q) || paint.code.toLowerCase().includes(q)
          if (!matches) return false
        }
        if (filters.brand !== 'all' && paint.brand !== filters.brand) return false
        if (filters.colorFamily !== 'all' && paint.colorFamily !== filters.colorFamily) {
          return false
        }
        if (filters.finishType !== 'all' && paint.finishType !== filters.finishType) {
          return false
        }
        return true
      })
  }, [stocks, paintById, filters])

  const brands = useMemo(() => {
    return Array.from(new Set(paints.map((p) => p.brand))).sort()
  }, [paints])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">塗料</h1>
          <p className="text-sm text-muted-foreground mt-1">
            在庫塗料 {stocks.length} 件中 {rows.length} 件を表示 (count = 0 は非表示)
          </p>
        </div>
        <Button component={Link} to="/paints/new">
          + 追加
        </Button>
      </div>
      <PaintFilterBar filters={filters} brands={brands} onChange={setFilters} />
      <div className="md:hidden">
        <PaintCardList rows={rows} />
      </div>
      <div className="hidden md:block">
        <PaintTable rows={rows} />
      </div>
    </div>
  )
}
