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

/** runtime narrowing: 想定外の値が来たら 'all' に fallback */
function toStatus(value: string): ProjectFilters['status'] {
  for (const status of STATUSES) {
    if (status === value) return status
  }
  return 'all'
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
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        placeholder="プロジェクト名で検索"
        className="md:col-span-2"
      />
      <FormControl fullWidth size="small">
        <Select<ProjectFilters['status']>
          value={filters.status}
          onChange={(event) =>
            onChange({ ...filters, status: toStatus(String(event.target.value)) })
          }
        >
          {STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {STATUS_LABEL[status]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
