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
import type { Kit, KitStock } from '~/entities/kit'

interface KitTableRow {
  stock: KitStock
  kit: Kit
}

const SORT_INDICATOR: Record<'asc' | 'desc', string> = { asc: ' ↑', desc: ' ↓' }

const columns: ColumnDef<KitTableRow>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.kit.name,
    header: '名前',
    cell: ({ row }) => <span className="font-medium">{row.original.kit.name}</span>,
  },
  {
    id: 'grade',
    accessorFn: (row) => row.kit.grade,
    header: 'グレード',
  },
  {
    id: 'scale',
    accessorFn: (row) => row.kit.scale,
    header: 'スケール',
  },
  {
    id: 'count',
    accessorFn: (row) => row.stock.count,
    header: '在庫数',
    cell: ({ row }) => <span className="font-medium">{row.original.stock.count} 個</span>,
  },
]

interface KitTableProps {
  rows: KitTableRow[]
}

export function KitTable({ rows }: KitTableProps) {
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
                該当するキットがありません
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() =>
                  void navigate({ to: '/kits/$kitId', params: { kitId: row.original.kit.id } })
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
