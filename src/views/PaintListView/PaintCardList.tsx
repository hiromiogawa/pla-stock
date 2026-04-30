import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import type { Paint, PaintStock } from '~/entities/paint'
import { VirtualizedCardList } from '~/widgets/VirtualizedCardList'

interface PaintCardRow {
  stock: PaintStock
  paint: Paint
}

interface PaintCardListProps {
  rows: PaintCardRow[]
}

export function PaintCardList({ rows }: PaintCardListProps) {
  return (
    <VirtualizedCardList
      rows={rows}
      rowKey={(row) => row.paint.id}
      estimateRowSize={92}
      emptyMessage="該当する塗料がありません"
      renderRow={({ paint, stock }) => (
        <Link
          to="/paints/$paintId"
          params={{ paintId: paint.id }}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              padding: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transition: 'background-color 120ms ease',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                flexShrink: 0,
                fontSize: '0.625rem',
                color: 'text.secondary',
              }}
            >
              {paint.swatchUrl ? (
                <Box
                  component="img"
                  src={paint.swatchUrl}
                  alt={paint.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                'No Swatch'
              )}
            </Box>
            <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {paint.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {paint.brand} · {paint.code}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {paint.colorFamily ?? '—'} · {paint.finishType ?? '—'}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                在庫 {stock.count} 本
              </Typography>
            </Stack>
          </Stack>
        </Link>
      )}
    />
  )
}
