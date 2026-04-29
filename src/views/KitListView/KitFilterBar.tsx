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

/** runtime narrowing: 想定外の値が来たら 'all' に fallback */
function toGrade(v: string): KitFilters['grade'] {
  for (const g of GRADES) {
    if (g === v) return g
  }
  return 'all'
}

function toScale(v: string): KitFilters['scale'] {
  for (const s of SCALES) {
    if (s === v) return s
  }
  return 'all'
}

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
        <Select<KitFilters['grade']>
          value={filters.grade}
          onChange={(e) => onChange({ ...filters, grade: toGrade(String(e.target.value)) })}
        >
          {GRADES.map((g) => (
            <MenuItem key={g} value={g}>
              {g === 'all' ? 'すべてのグレード' : g}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select<KitFilters['scale']>
          value={filters.scale}
          onChange={(e) => onChange({ ...filters, scale: toScale(String(e.target.value)) })}
        >
          {SCALES.map((s) => (
            <MenuItem key={s} value={s}>
              {s === 'all' ? 'すべてのスケール' : s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <Select<string>
          value={filters.maker}
          onChange={(e) => onChange({ ...filters, maker: String(e.target.value) })}
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
