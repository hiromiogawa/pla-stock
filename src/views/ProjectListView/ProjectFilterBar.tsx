import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { ProjectStatus } from '~/entities/project'
import { Input } from '~/shared/ui/input'

export interface ProjectFilters {
  search: string
  status: ProjectStatus | 'all'
}

export const INITIAL_FILTERS: ProjectFilters = {
  search: '',
  status: 'all',
}

const STATUSES: Array<ProjectStatus | 'all'> = [
  'all',
  'planning',
  'building',
  'completed',
  'abandoned',
]

const STATUS_LABEL: Record<ProjectStatus | 'all', string> = {
  all: 'すべて',
  planning: '計画中',
  building: '製作中',
  completed: '完成',
  abandoned: '頓挫',
}

interface ProjectFilterBarProps {
  filters: ProjectFilters
  onChange: (next: ProjectFilters) => void
}

export function ProjectFilterBar({ filters, onChange }: ProjectFilterBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-card">
      <Input
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="プロジェクト名で検索"
        className="md:col-span-2"
      />
      <FormControl fullWidth size="small">
        <Select
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as ProjectFilters['status'] })
          }
        >
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
