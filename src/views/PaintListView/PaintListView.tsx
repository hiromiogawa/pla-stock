import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Paint, PaintStock } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { PaintCardList } from './PaintCardList'
import { PaintFilterBar, INITIAL_FILTERS, type PaintFilters } from './PaintFilterBar'
import { PaintTable } from './PaintTable'

interface PaintListViewProps {
  /** count > 0 の paint_stock のみ渡す (ローダー側で絞り込み済み) */
  stocks: PaintStock[]
  paints: Paint[]
}

export function PaintListView({ stocks, paints }: PaintListViewProps) {
  const [filters, setFilters] = useState<PaintFilters>(INITIAL_FILTERS)

  const paintById = useMemo(() => new Map(paints.map((paint) => [paint.id, paint])), [paints])

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
          const normalized = filters.search.toLowerCase()
          const matches =
            paint.name.toLowerCase().includes(normalized) ||
            paint.code.toLowerCase().includes(normalized)
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
    return Array.from(new Set(paints.map((paint) => paint.brand))).sort()
  }, [paints])

  return (
    <Stack
      spacing={3}
      sx={{ maxWidth: '896px', mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            塗料
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {rows.length} / {stocks.length} 件
          </Typography>
        </Stack>
        <Button component={Link} to="/paints/new" variant="outline" size="sm" sx={{ gap: 0.75 }}>
          <Plus size={14} strokeWidth={1.75} />
          追加
        </Button>
      </Stack>

      <PaintFilterBar filters={filters} brands={brands} onChange={setFilters} />

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <PaintCardList rows={rows} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <PaintTable rows={rows} />
      </Box>
    </Stack>
  )
}
