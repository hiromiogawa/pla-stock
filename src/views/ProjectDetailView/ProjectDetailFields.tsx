import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import type { Kit } from '~/entities/kit'
import type { Project } from '~/entities/project'

const STATUS_LABEL: Record<Project['status'], string> = {
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

const fieldRowSx = {
  display: 'grid',
  gridTemplateColumns: '1fr 2fr',
  gap: 2,
  py: 1.25,
  borderBottom: 1,
  borderColor: 'divider',
  '&:last-child': { borderBottom: 0 },
} as const

interface FieldRowProps {
  label: string
  value: string | null | undefined
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <Box sx={fieldRowSx}>
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ margin: 0 }}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

interface KitRowProps {
  kit: Kit
}

// kit は別 entity だが「このプロジェクトで何を作っているか」は
// プロジェクト情報の一部として扱う方が読み手の認知負荷が低いため、
// 独立 section ではなく dl 内に同居させる。
function KitRow({ kit }: KitRowProps) {
  return (
    <Box sx={fieldRowSx}>
      <Typography component="dt" variant="body2" color="text.secondary">
        使用キット
      </Typography>
      <Box component="dd" sx={{ margin: 0, minWidth: 0 }}>
        <Link
          to="/kits/$kitId"
          params={{ kitId: kit.id }}
          style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}
        >
          <Stack
            spacing={0.25}
            sx={{
              transition: 'opacity 120ms ease',
              '&:hover': { opacity: 0.7 },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {kit.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {kit.grade} · {kit.scale}
            </Typography>
          </Stack>
        </Link>
      </Box>
    </Box>
  )
}

interface ProjectDetailFieldsProps {
  project: Project
  kit: Kit
}

export function ProjectDetailFields({ project, kit }: ProjectDetailFieldsProps) {
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
        <KitRow kit={kit} />
      </Box>
    </Box>
  )
}
