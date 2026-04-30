import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Kit, KitStock } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { KitCardList } from './KitCardList'
import { KitFilterBar, INITIAL_FILTERS, type KitFilters } from './KitFilterBar'
import { KitTable } from './KitTable'

interface KitListViewProps {
  /** count > 0 の kit_stock のみ渡す (ローダー側で絞り込み済み) */
  stocks: KitStock[]
  kits: Kit[]
}

export function KitListView({ stocks, kits }: KitListViewProps) {
  const [filters, setFilters] = useState<KitFilters>(INITIAL_FILTERS)

  const kitById = useMemo(() => new Map(kits.map((kit) => [kit.id, kit])), [kits])

  const rows = useMemo(() => {
    return stocks
      .map((stock) => {
        const kit = kitById.get(stock.kitId)
        if (!kit) return null
        return { stock, kit }
      })
      .filter((row): row is { stock: KitStock; kit: Kit } => row !== null)
      .filter(({ kit }) => {
        if (filters.search && !kit.name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false
        }
        if (filters.grade !== 'all' && kit.grade !== filters.grade) return false
        if (filters.scale !== 'all' && kit.scale !== filters.scale) return false
        return true
      })
  }, [stocks, kitById, filters])

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
            キット
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {rows.length} / {stocks.length} 件
          </Typography>
        </Stack>
        <Button component={Link} to="/kits/new" variant="outline" size="sm" sx={{ gap: 0.75 }}>
          <Plus size={14} strokeWidth={1.75} />
          追加
        </Button>
      </Stack>

      <KitFilterBar filters={filters} onChange={setFilters} />

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <KitCardList rows={rows} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <KitTable rows={rows} />
      </Box>
    </Stack>
  )
}
