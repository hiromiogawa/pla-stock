import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { Grade, Scale } from '~/entities/kit'
import { Input } from '~/shared/ui/input'

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

/** runtime narrowing: 想定外の値が来たら 'all' に fallback */
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-card">
      <Input
        type="search"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        placeholder="名前で検索"
        className="md:col-span-2"
      />
      <FormControl fullWidth size="small">
        <Select<KitFilters['grade']>
          value={filters.grade}
          onChange={(event) => onChange({ ...filters, grade: toGrade(String(event.target.value)) })}
        >
          {GRADES.map((grade) => (
            <MenuItem key={grade} value={grade}>
              {grade === 'all' ? 'すべてのグレード' : grade}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select<KitFilters['scale']>
          value={filters.scale}
          onChange={(event) => onChange({ ...filters, scale: toScale(String(event.target.value)) })}
        >
          {SCALES.map((scale) => (
            <MenuItem key={scale} value={scale}>
              {scale === 'all' ? 'すべてのスケール' : scale}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
