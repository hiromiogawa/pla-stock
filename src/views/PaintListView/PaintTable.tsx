import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Paint, PaintStock } from '~/entities/paint'

interface PaintTableRow {
  stock: PaintStock
  paint: Paint
}

const SORT_INDICATOR: Record<'asc' | 'desc', string> = { asc: ' ↑', desc: ' ↓' }

const columns: ColumnDef<PaintTableRow>[] = [
  {
    id: 'image',
    header: '',
    enableSorting: false,
    cell: ({ row }) => {
      const { swatchUrl, name } = row.original.paint
      return (
        <div className="w-12 h-12 shrink-0 rounded border border-border bg-muted/40 overflow-hidden flex items-center justify-center text-[10px] text-muted-foreground">
          {swatchUrl ? (
            <img src={swatchUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            'No Swatch'
          )}
        </div>
      )
    },
  },
  {
    id: 'brand',
    accessorFn: (row) => row.paint.brand,
    header: 'ブランド',
  },
  {
    id: 'code',
    accessorFn: (row) => row.paint.code,
    header: 'コード',
  },
  {
    id: 'name',
    accessorFn: (row) => row.paint.name,
    header: '名前',
  },
  {
    id: 'colorFamily',
    accessorFn: (row) => row.paint.colorFamily ?? '—',
    header: '色系統',
  },
  {
    id: 'finishType',
    accessorFn: (row) => row.paint.finishType ?? '—',
    header: 'フィニッシュ',
  },
  {
    id: 'count',
    accessorFn: (row) => row.stock.count,
    header: '在庫数',
    cell: ({ row }) => <span className="font-medium">{row.original.stock.count} 本</span>,
  },
]

interface PaintTableProps {
  rows: PaintTableRow[]
}

export function PaintTable({ rows }: PaintTableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left font-medium text-muted-foreground cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="inline-flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {(() => {
                      const sorted = header.column.getIsSorted()
                      return sorted === false ? null : SORT_INDICATOR[sorted]
                    })()}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">
                該当する塗料がありません
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() =>
                  void navigate({
                    to: '/paints/$paintId',
                    params: { paintId: row.original.paint.id },
                  })
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
