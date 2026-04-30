import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import type { Kit, KitStock } from '~/entities/kit'
import { VirtualizedCardList } from '~/widgets/VirtualizedCardList'

interface KitCardRow {
  stock: KitStock
  kit: Kit
}

interface KitCardListProps {
  rows: KitCardRow[]
}

export function KitCardList({ rows }: KitCardListProps) {
  return (
    <VirtualizedCardList
      rows={rows}
      rowKey={(row) => row.kit.id}
      emptyMessage="該当するキットがありません"
      renderRow={({ kit, stock }) => (
        <Link
          to="/kits/$kitId"
          params={{ kitId: kit.id }}
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
              {kit.boxArtUrl ? (
                <Box
                  component="img"
                  src={kit.boxArtUrl}
                  alt={kit.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                'No Image'
              )}
            </Box>
            <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={500} noWrap>
                {kit.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kit.grade} · {kit.scale}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                在庫 {stock.count} 個
              </Typography>
            </Stack>
          </Stack>
        </Link>
      )}
    />
  )
}
