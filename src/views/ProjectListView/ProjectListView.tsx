import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Project } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import { ProjectCardList } from './ProjectCardList'
import { ProjectFilterBar, INITIAL_FILTERS, type ProjectFilters } from './ProjectFilterBar'
import { ProjectTable } from './ProjectTable'

interface ProjectListViewProps {
  projects: Project[]
  /** project.id → 紐付きキット名 (未紐付き or 解決失敗時は null) の map */
  kitNameByProjectId: Record<string, string | null>
  /** project.id → 紐付きキットの box art URL (未紐付き / 画像なし時は null) の map */
  kitBoxArtByProjectId: Record<string, string | null>
}

export function ProjectListView({
  projects,
  kitNameByProjectId,
  kitBoxArtByProjectId,
}: ProjectListViewProps) {
  const [filters, setFilters] = useState<ProjectFilters>(INITIAL_FILTERS)

  const rows = useMemo(() => {
    return projects
      .map((project) => ({
        project,
        linkedKitName: kitNameByProjectId[project.id] ?? null,
        linkedKitBoxArtUrl: kitBoxArtByProjectId[project.id] ?? null,
      }))
      .filter(({ project }) => {
        if (filters.search) {
          const normalized = filters.search.toLowerCase()
          if (!project.name.toLowerCase().includes(normalized)) return false
        }
        if (filters.status !== 'all' && project.status !== filters.status) return false
        return true
      })
  }, [projects, kitNameByProjectId, kitBoxArtByProjectId, filters])

  return (
    <Stack
      spacing={3}
      sx={{ maxWidth: '896px', mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            プロジェクト
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {rows.length} / {projects.length} 件
          </Typography>
        </Stack>
        <Button component={Link} to="/projects/new" variant="outline" size="sm" sx={{ gap: 0.75 }}>
          <Plus size={14} strokeWidth={1.75} />
          追加
        </Button>
      </Stack>

      <ProjectFilterBar filters={filters} onChange={setFilters} />

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <ProjectCardList rows={rows} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <ProjectTable rows={rows} />
      </Box>
    </Stack>
  )
}
