import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Project } from '~/entities/project'

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

interface FieldRowProps {
  label: string
  value: string | null | undefined
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: 2,
        py: 1.25,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ margin: 0 }}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

interface ProjectDetailFieldsProps {
  project: Project
}

export function ProjectDetailFields({ project }: ProjectDetailFieldsProps) {
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
      <Stack direction="row" alignItems="center" sx={{ mb: 1.25 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          プロジェクト情報
        </Typography>
      </Stack>
      <Box component="dl" sx={{ margin: 0 }}>
        <FieldRow label="名前" value={project.name} />
        <FieldRow label="説明" value={project.description} />
        <FieldRow label="ステータス" value={STATUS_LABEL[project.status]} />
        <FieldRow label="開始日" value={project.startedAt} />
        <FieldRow label="完成日" value={project.completedAt} />
      </Box>
    </Box>
  )
}
