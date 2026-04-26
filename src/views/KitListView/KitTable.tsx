import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import type { Kit, KitStock } from '~/entities/kit'
import { Badge } from '~/shared/ui/badge'

export interface KitTableRow {
  stock: KitStock
  kit: Kit
}

const ASSEMBLY_LABEL: Record<KitStock['assemblyStatus'], string> = {
  unbuilt: '未組立',
  building: '組立中',
  completed: '完成',
}

const columns: ColumnDef<KitTableRow>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.kit.name,
    header: '名前',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.kit.name}</div>
        {row.original.kit.visibility === 'private' && (
          <Badge variant="outline" className="text-xs mt-1">private</Badge>
        )}
      </div>
    ),
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
    id: 'maker',
    accessorFn: (row) => row.kit.maker,
    header: 'ブランド',
  },
  {
    id: 'assemblyStatus',
    accessorFn: (row) => row.stock.assemblyStatus,
    header: '組立状態',
    cell: ({ getValue }) => ASSEMBLY_LABEL[getValue() as KitStock['assemblyStatus']],
  },
  {
    id: 'photo',
    accessorFn: (row) => (row.stock.photoUrl ? '有' : '無'),
    header: '写真',
  },
]

export interface KitTableProps {
  rows: KitTableRow[]
}

export function KitTable({ rows }: KitTableProps) {
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
                該当するキットがありません
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
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
