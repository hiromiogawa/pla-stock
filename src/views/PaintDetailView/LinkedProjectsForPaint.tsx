import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import type { Project } from '~/entities/project'
import { Badge } from '~/shared/ui/badge'

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

interface LinkedProjectsForPaintProps {
  projects: Project[]
}

export function LinkedProjectsForPaint({ projects }: LinkedProjectsForPaintProps) {
  return (
    <Box
      component="section"
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        padding: 2,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.25 }}>
        この塗料を使うプロジェクト
      </Typography>
      {projects.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          この塗料を使うプロジェクトはまだありません
        </Typography>
      ) : (
        <Stack
          component="ul"
          spacing={1}
          sx={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            // 紐付き project が増えた時 (20+) でも他 section を圧迫しないよう max-height + scroll
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {projects.map((project) => (
            <Stack
              key={project.id}
              component="li"
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1.5}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Link
                  to="/projects/$id"
                  params={{ id: project.id }}
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'inherit',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {project.name}
                </Link>
              </Box>
              <Badge variant="outline" className="text-xs">
                {STATUS_LABEL[project.status]}
              </Badge>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  )
}
