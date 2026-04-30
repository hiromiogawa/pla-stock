import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import type { Kit, KitStock } from '~/entities/kit'
import { VirtualizedTable } from '~/widgets/VirtualizedTable'

interface KitTableRow {
  stock: KitStock
  kit: Kit
}

const columns: ColumnDef<KitTableRow>[] = [
  {
    id: 'image',
    header: '',
    enableSorting: false,
    size: 64,
    cell: ({ row }) => {
      const { boxArtUrl, name } = row.original.kit
      return (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.625rem',
            color: 'text.secondary',
          }}
        >
          {boxArtUrl ? (
            <Box
              component="img"
              src={boxArtUrl}
              alt={name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            'No Image'
          )}
        </Box>
      )
    },
  },
  {
    id: 'name',
    accessorFn: (row) => row.kit.name,
    header: '名前',
    cell: ({ row }) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {row.original.kit.name}
      </Typography>
    ),
  },
  {
    id: 'meta',
    accessorFn: (row) => `${row.kit.grade} ${row.kit.scale}`,
    header: 'グレード · スケール',
    cell: ({ row }) => (
      <Typography variant="body2" color="text.secondary">
        {row.original.kit.grade} · {row.original.kit.scale}
      </Typography>
    ),
  },
  {
    id: 'count',
    accessorFn: (row) => row.stock.count,
    header: '在庫',
    size: 80,
    cell: ({ row }) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {row.original.stock.count} 個
      </Typography>
    ),
  },
]

interface KitTableProps {
  rows: KitTableRow[]
}

export function KitTable({ rows }: KitTableProps) {
  const navigate = useNavigate()
  return (
    <VirtualizedTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.kit.id}
      onRowClick={(row) => void navigate({ to: '/kits/$kitId', params: { kitId: row.kit.id } })}
      rowHref={(row) => `/kits/${row.kit.id}`}
      emptyMessage="該当するキットがありません"
    />
  )
}
