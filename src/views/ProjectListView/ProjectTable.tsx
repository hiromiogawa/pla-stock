import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { PROJECT_STATUS_LABEL, type Project } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'
import { VirtualizedTable } from '~/widgets/VirtualizedTable'

interface ProjectTableRow {
  project: Project
  linkedKitName: string | null
  linkedKitBoxArtUrl: string | null
}

const columns: ColumnDef<ProjectTableRow>[] = [
  {
    id: 'image',
    header: '',
    enableSorting: false,
    size: 64,
    cell: ({ row }) => {
      const { linkedKitBoxArtUrl } = row.original
      const projectName = row.original.project.name
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
          {linkedKitBoxArtUrl ? (
            <Box
              component="img"
              src={linkedKitBoxArtUrl}
              alt={projectName}
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
    accessorFn: (row) => row.project.name,
    header: '名前',
    cell: ({ row }) => (
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {row.original.project.name}
        </Typography>
        {row.original.project.description && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.original.project.description}
          </Typography>
        )}
      </Stack>
    ),
  },
  {
    id: 'status',
    accessorFn: (row) => row.project.status,
    header: 'ステータス',
    size: 100,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {PROJECT_STATUS_LABEL[row.original.project.status]}
      </Badge>
    ),
  },
  {
    id: 'kit',
    accessorFn: (row) => row.linkedKitName ?? '',
    header: '使用キット',
    cell: ({ row }) => {
      const value = row.original.linkedKitName
      return (
        <Typography variant="body2" color={value ? 'text.primary' : 'text.secondary'} noWrap>
          {value ?? '未紐付き'}
        </Typography>
      )
    },
  },
  {
    id: 'period',
    accessorFn: (row) => row.project.startedAt ?? '',
    header: '開始 → 完成',
    size: 160,
    cell: ({ row }) => {
      const start = row.original.project.startedAt
      const end = row.original.project.completedAt
      return (
        <Typography variant="body2" color="text.secondary" noWrap>
          {start ?? '—'} → {end ?? '—'}
        </Typography>
      )
    },
  },
]

interface ProjectTableProps {
  rows: ProjectTableRow[]
}

export function ProjectTable({ rows }: ProjectTableProps) {
  const navigate = useNavigate()
  return (
    <VirtualizedTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.project.id}
      onRowClick={(row) => void navigate({ to: '/projects/$id', params: { id: row.project.id } })}
      rowHref={(row) => `/projects/${row.project.id}`}
      estimateRowSize={64}
      emptyMessage="該当するプロジェクトがありません"
    />
  )
}
