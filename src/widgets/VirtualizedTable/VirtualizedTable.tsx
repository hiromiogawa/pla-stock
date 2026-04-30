import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'

interface VirtualizedTableProps<TRow> {
  rows: TRow[]
  columns: ColumnDef<TRow>[]
  rowKey: (row: TRow) => string
  /** Normal click navigation. Use TanStack Router's typed `useNavigate()` from caller. */
  onRowClick: (row: TRow) => void
  /** URL string for middle-click / cmd-click new tab open. */
  rowHref: (row: TRow) => string
  /** Default 56px. */
  estimateRowSize?: number
  emptyMessage: string
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }): ReactNode {
  if (sorted === 'asc') {
    return <ChevronUp size={12} strokeWidth={1.75} />
  }
  if (sorted === 'desc') {
    return <ChevronDown size={12} strokeWidth={1.75} />
  }
  return (
    <Box sx={{ opacity: 0.3, display: 'inline-flex' }}>
      <ChevronsUpDown size={12} strokeWidth={1.75} />
    </Box>
  )
}

/**
 * Refined Minimalism craft の virtualized table。
 * 担当: scroll container / virtualization / sticky header / chevron sort indicator /
 * row click (SPA + middle/cmd で新タブ) / empty state.
 * 非担当: column 定義は consumer が渡す。
 */
export function VirtualizedTable<TRow>({
  rows,
  columns,
  rowKey,
  onRowClick,
  rowHref,
  estimateRowSize = 56,
  emptyMessage,
}: VirtualizedTableProps<TRow>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const tableRows = table.getRowModel().rows
  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateRowSize,
    overscan: 8,
  })

  if (rows.length === 0) {
    return (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textAlign: 'center',
          py: 6,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <Box sx={{ borderRadius: 2, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Box ref={containerRef} sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Box
          component="table"
          sx={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14 }}
        >
          <Box component="thead">
            {table.getHeaderGroups().map((headerGroup) => (
              <Box component="tr" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const canSort = header.column.getCanSort()
                  const sizeStyle = header.column.columnDef.size
                    ? { width: header.column.columnDef.size }
                    : {}
                  return (
                    <Box
                      component="th"
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        bgcolor: 'background.paper',
                        textAlign: 'left',
                        px: 1.5,
                        py: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                        ...sizeStyle,
                      }}
                    >
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Typography>
                        {canSort && (
                          <Box sx={{ display: 'inline-flex', color: 'text.secondary' }}>
                            <SortIcon sorted={sorted} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            ))}
          </Box>
          <Box component="tbody" sx={{ position: 'relative', height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = tableRows[virtualRow.index]
              if (!row) return null
              const original = row.original
              const href = rowHref(original)
              return (
                <Box
                  component="tr"
                  key={rowKey(original)}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey) {
                      window.open(href, '_blank')
                    } else {
                      onRowClick(original)
                    }
                  }}
                  onAuxClick={(event) => {
                    if (event.button === 1) {
                      window.open(href, '_blank')
                    }
                  }}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    cursor: 'pointer',
                    transition: 'background-color 120ms ease',
                    '&:hover': { backgroundColor: 'action.hover' },
                    display: 'table',
                    tableLayout: 'fixed',
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellSizeStyle = cell.column.columnDef.size
                      ? { width: cell.column.columnDef.size }
                      : {}
                    return (
                      <Box
                        component="td"
                        key={cell.id}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderBottom: 1,
                          borderColor: 'divider',
                          verticalAlign: 'middle',
                          ...cellSizeStyle,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Box>
                    )
                  })}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
