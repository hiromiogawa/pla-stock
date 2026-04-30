import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Search } from 'lucide-react'
import { PROJECT_STATUS_LABEL, type ProjectStatus } from '~/entities/project'

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

function statusLabel(status: ProjectStatus | 'all'): string {
  return status === 'all' ? 'すべてのステータス' : PROJECT_STATUS_LABEL[status]
}

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
  const hasActiveFilter = filters.search !== '' || filters.status !== 'all'

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        fullWidth
        type="search"
        placeholder="名前で検索"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} strokeWidth={1.75} />
              </InputAdornment>
            ),
          },
        }}
      />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select<ProjectFilters['status']>
            value={filters.status}
            onChange={(event) =>
              onChange({ ...filters, status: toStatus(String(event.target.value)) })
            }
          >
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {statusLabel(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {hasActiveFilter && (
          <Button
            size="small"
            onClick={() => onChange(INITIAL_FILTERS)}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            クリア
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
