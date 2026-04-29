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
import type { Project } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'

interface ProjectTableRow {
  project: Project
  linkedKitName: string | null
  linkedKitBoxArtUrl: string | null
}

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

const SORT_INDICATOR: Record<'asc' | 'desc', string> = { asc: ' ↑', desc: ' ↓' }

const columns: ColumnDef<ProjectTableRow>[] = [
  {
    id: 'image',
    header: '',
    enableSorting: false,
    cell: ({ row }) => {
      const { linkedKitBoxArtUrl } = row.original
      const projectName = row.original.project.name
      return (
        <div className="w-12 h-12 shrink-0 rounded border border-border bg-muted/40 overflow-hidden flex items-center justify-center text-[10px] text-muted-foreground">
          {linkedKitBoxArtUrl ? (
            <img
              src={linkedKitBoxArtUrl}
              alt={projectName}
              className="w-full h-full object-cover"
            />
          ) : (
            'No Image'
          )}
        </div>
      )
    },
  },
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
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {STATUS_LABEL[row.original.project.status]}
      </Badge>
    ),
  },
  {
    id: 'kit',
    accessorFn: (row) => row.linkedKitName ?? '',
    header: '使用キット',
    cell: ({ row }) => {
      const value = row.original.linkedKitName
      return value === null || value === '' ? (
        <span className="text-muted-foreground">未紐付き</span>
      ) : (
        value
      )
    },
  },
  {
    id: 'startedAt',
    accessorFn: (row) => row.project.startedAt ?? '',
    header: '開始日',
    cell: ({ row }) => {
      const value = row.original.project.startedAt
      return value === null || value === '' ? '—' : value
    },
  },
  {
    id: 'completedAt',
    accessorFn: (row) => row.project.completedAt ?? '',
    header: '完成日',
    cell: ({ row }) => {
      const value = row.original.project.completedAt
      return value === null || value === '' ? '—' : value
    },
  },
]

interface ProjectTableProps {
  rows: ProjectTableRow[]
}

export function ProjectTable({ rows }: ProjectTableProps) {
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
                該当するプロジェクトがありません
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() =>
                  void navigate({ to: '/projects/$id', params: { id: row.original.project.id } })
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
