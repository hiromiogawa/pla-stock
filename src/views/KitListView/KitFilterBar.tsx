import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { Grade, Scale } from '~/entities/kit'
import { Input } from '~/shared/ui/input'

export interface KitFilters {
  search: string
  grade: Grade | 'all'
  scale: Scale | 'all'
  maker: string | 'all'
}

export const INITIAL_FILTERS: KitFilters = {
  search: '',
  grade: 'all',
  scale: 'all',
  maker: 'all',
}

const GRADES: Array<Grade | 'all'> = ['all', 'HG', 'RG', 'EG', 'MG', 'PG', 'other']
const SCALES: Array<Scale | 'all'> = ['all', '1/144', '1/100', '1/60', '1/48', 'other']

interface KitFilterBarProps {
  filters: KitFilters
  makers: string[] // 一覧から動的に集めた候補
  onChange: (next: KitFilters) => void
}

export function KitFilterBar({ filters, makers, onChange }: KitFilterBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-card">
      <Input
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="名前で検索"
        className="md:col-span-3"
      />
      <FormControl fullWidth size="small">
        <Select
          value={filters.grade}
          onChange={(e) => onChange({ ...filters, grade: e.target.value as KitFilters['grade'] })}
        >
          {GRADES.map((g) => (
            <MenuItem key={g} value={g}>
              {g === 'all' ? 'すべてのグレード' : g}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select
          value={filters.scale}
          onChange={(e) => onChange({ ...filters, scale: e.target.value as KitFilters['scale'] })}
        >
          {SCALES.map((s) => (
            <MenuItem key={s} value={s}>
              {s === 'all' ? 'すべてのスケール' : s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select
          value={filters.maker}
          onChange={(e) => onChange({ ...filters, maker: e.target.value as string })}
        >
          <MenuItem value="all">すべてのブランド</MenuItem>
          {makers.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
