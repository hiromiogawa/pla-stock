import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import type { Project } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'
import { VirtualizedCardList } from '~/widgets/VirtualizedCardList'

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

interface ProjectCardRow {
  project: Project
  linkedKitName: string | null
  linkedKitBoxArtUrl: string | null
}

interface ProjectCardListProps {
  rows: ProjectCardRow[]
}

export function ProjectCardList({ rows }: ProjectCardListProps) {
  return (
    <VirtualizedCardList
      rows={rows}
      rowKey={(row) => row.project.id}
      estimateRowSize={100}
      emptyMessage="該当するプロジェクトがありません"
      renderRow={({ project, linkedKitName, linkedKitBoxArtUrl }) => (
        <Link
          to="/projects/$id"
          params={{ id: project.id }}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            sx={{
              padding: 1.5,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transition: 'background-color 120ms ease',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                flexShrink: 0,
                fontSize: '0.625rem',
                color: 'text.secondary',
              }}
            >
              {linkedKitBoxArtUrl ? (
                <Box
                  component="img"
                  src={linkedKitBoxArtUrl}
                  alt={project.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                'No Image'
              )}
            </Box>
            <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {project.name}
                </Typography>
                <Badge variant="outline" className="text-xs">
                  {STATUS_LABEL[project.status]}
                </Badge>
              </Stack>
              <Typography variant="caption" color="text.secondary" noWrap>
                {linkedKitName ?? '未紐付き'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {project.startedAt ?? '—'} → {project.completedAt ?? '—'}
              </Typography>
            </Stack>
          </Stack>
        </Link>
      )}
    />
  )
}
