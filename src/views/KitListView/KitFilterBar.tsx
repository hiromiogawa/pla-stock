import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Search } from 'lucide-react'
import type { Grade, Scale } from '~/entities/kit'

export interface KitFilters {
  search: string
  grade: Grade | 'all'
  scale: Scale | 'all'
}

export const INITIAL_FILTERS: KitFilters = {
  search: '',
  grade: 'all',
  scale: 'all',
}

const GRADES: Array<Grade | 'all'> = ['all', 'HG', 'RG', 'EG', 'MG', 'PG', 'other']
const SCALES: Array<Scale | 'all'> = ['all', '1/144', '1/100', '1/60', '1/48', 'other']

function toGrade(value: string): KitFilters['grade'] {
  for (const grade of GRADES) {
    if (grade === value) return grade
  }
  return 'all'
}

function toScale(value: string): KitFilters['scale'] {
  for (const scale of SCALES) {
    if (scale === value) return scale
  }
  return 'all'
}

interface KitFilterBarProps {
  filters: KitFilters
  onChange: (next: KitFilters) => void
}

export function KitFilterBar({ filters, onChange }: KitFilterBarProps) {
  const hasActiveFilter =
    filters.search !== '' || filters.grade !== 'all' || filters.scale !== 'all'

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
          <Select<KitFilters['grade']>
            value={filters.grade}
            onChange={(event) =>
              onChange({ ...filters, grade: toGrade(String(event.target.value)) })
            }
          >
            {GRADES.map((grade) => (
              <MenuItem key={grade} value={grade}>
                {grade === 'all' ? 'すべてのグレード' : grade}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select<KitFilters['scale']>
            value={filters.scale}
            onChange={(event) =>
              onChange({ ...filters, scale: toScale(String(event.target.value)) })
            }
          >
            {SCALES.map((scale) => (
              <MenuItem key={scale} value={scale}>
                {scale === 'all' ? 'すべてのスケール' : scale}
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
