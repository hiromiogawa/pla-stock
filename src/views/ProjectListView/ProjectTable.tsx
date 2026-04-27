import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import type { Project } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'

export interface ProjectTableRow {
  project: Project
  linkedKitName: string | null
}

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

const columns: ColumnDef<ProjectTableRow>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.project.name,
    header: '名前',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.project.name}</div>
        {row.original.project.description && (
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {row.original.project.description}
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'status',
    accessorFn: (row) => row.project.status,
    header: 'ステータス',
    cell: ({ getValue }) => {
      const status = getValue() as Project['status']
      return <Badge variant="outline" className="text-xs">{STATUS_LABEL[status]}</Badge>
    },
  },
  {
    id: 'kit',
    accessorFn: (row) => row.linkedKitName ?? '',
    header: '使用キット',
    cell: ({ getValue }) => {
      const v = getValue() as string
      return v === '' ? <span className="text-muted-foreground">未紐付き</span> : v
    },
  },
  {
    id: 'startedAt',
    accessorFn: (row) => row.project.startedAt ?? '',
    header: '開始日',
    cell: ({ getValue }) => {
      const v = getValue() as string
      return v === '' ? '—' : v
    },
  },
  {
    id: 'completedAt',
    accessorFn: (row) => row.project.completedAt ?? '',
    header: '完成日',
    cell: ({ getValue }) => {
      const v = getValue() as string
      return v === '' ? '—' : v
    },
  },
]

export interface ProjectTableProps {
  rows: ProjectTableRow[]
}

export function ProjectTable({ rows }: ProjectTableProps) {
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
                該当するプロジェクトがありません
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
