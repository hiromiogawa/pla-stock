import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import type { Paint, PaintStock } from '~/entities/paint'
import { VirtualizedTable } from '~/widgets/VirtualizedTable'

interface PaintTableRow {
  stock: PaintStock
  paint: Paint
}

const columns: ColumnDef<PaintTableRow>[] = [
  {
    id: 'image',
    header: '',
    enableSorting: false,
    size: 64,
    cell: ({ row }) => {
      const { swatchUrl, name } = row.original.paint
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
          {swatchUrl ? (
            <Box
              component="img"
              src={swatchUrl}
              alt={name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            'No Swatch'
          )}
        </Box>
      )
    },
  },
  {
    id: 'identifier',
    accessorFn: (row) => row.paint.name,
    header: '名前',
    cell: ({ row }) => (
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {row.original.paint.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {row.original.paint.brand} · {row.original.paint.code}
        </Typography>
      </Stack>
    ),
  },
  {
    id: 'meta',
    accessorFn: (row) => `${row.paint.colorFamily ?? ''} ${row.paint.finishType ?? ''}`,
    header: '色系統 · フィニッシュ',
    cell: ({ row }) => (
      <Typography variant="body2" color="text.secondary">
        {row.original.paint.colorFamily ?? '—'} · {row.original.paint.finishType ?? '—'}
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
        {row.original.stock.count} 本
      </Typography>
    ),
  },
]

interface PaintTableProps {
  rows: PaintTableRow[]
}

export function PaintTable({ rows }: PaintTableProps) {
  const navigate = useNavigate()
  return (
    <VirtualizedTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.paint.id}
      onRowClick={(row) =>
        void navigate({ to: '/paints/$paintId', params: { paintId: row.paint.id } })
      }
      rowHref={(row) => `/paints/${row.paint.id}`}
      estimateRowSize={64}
      emptyMessage="該当する塗料がありません"
    />
  )
}
