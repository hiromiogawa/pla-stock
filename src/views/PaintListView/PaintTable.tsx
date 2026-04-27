import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Paint, PaintStock } from '~/entities/paint'
import { Badge } from '~/shared/ui/badge'

export interface PaintTableRow {
  stock: PaintStock
  paint: Paint
}

const columns: ColumnDef<PaintTableRow>[] = [
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
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link
          to="/paints/$paintId"
          params={{ paintId: row.original.paint.id }}
          className="hover:underline"
        >
          {row.original.paint.name}
        </Link>
        {row.original.paint.visibility === 'private' && (
          <Badge variant="outline" className="text-xs">
            private
          </Badge>
        )}
      </div>
    ),
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
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as number} 本</span>
    ),
  },
]

export interface PaintTableProps {
  rows: PaintTableRow[]
}

export function PaintTable({ rows }: PaintTableProps) {
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
                    {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
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
              <tr key={row.id} className="border-t border-border hover:bg-muted/30 transition-colors">
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
