import type { Grade, Scale, AssemblyStatus } from '~/entities/kit'
import { Input } from '~/shared/ui/input'
import { Checkbox } from '~/shared/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/ui/select'

export interface KitFilters {
  search: string
  grade: Grade | 'all'
  scale: Scale | 'all'
  assemblyStatus: AssemblyStatus | 'all'
  maker: string | 'all'
  hasPhoto: boolean
}

export const INITIAL_FILTERS: KitFilters = {
  search: '',
  grade: 'all',
  scale: 'all',
  assemblyStatus: 'all',
  maker: 'all',
  hasPhoto: false,
}

const GRADES: Array<Grade | 'all'> = ['all', 'HG', 'RG', 'EG', 'MG', 'PG', 'other']
const SCALES: Array<Scale | 'all'> = ['all', '1/144', '1/100', '1/60', '1/48', 'other']
const ASSEMBLY_STATUSES: Array<AssemblyStatus | 'all'> = ['all', 'unbuilt', 'building', 'completed']

const ASSEMBLY_LABEL: Record<AssemblyStatus | 'all', string> = {
  all: 'すべて',
  unbuilt: '未組立',
  building: '組立中',
  completed: '完成',
}

export interface KitFilterBarProps {
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
      <Select
        value={filters.grade}
        onValueChange={(v) => onChange({ ...filters, grade: v as KitFilters['grade'] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="グレード" />
        </SelectTrigger>
        <SelectContent>
          {GRADES.map((g) => (
            <SelectItem key={g} value={g}>
              {g === 'all' ? 'すべてのグレード' : g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.scale}
        onValueChange={(v) => onChange({ ...filters, scale: v as KitFilters['scale'] })}
      >
        <SelectTrigger>
          <SelectValue placeholder="スケール" />
        </SelectTrigger>
        <SelectContent>
          {SCALES.map((s) => (
            <SelectItem key={s} value={s}>
              {s === 'all' ? 'すべてのスケール' : s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.assemblyStatus}
        onValueChange={(v) =>
          onChange({ ...filters, assemblyStatus: v as KitFilters['assemblyStatus'] })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="組立状態" />
        </SelectTrigger>
        <SelectContent>
          {ASSEMBLY_STATUSES.map((a) => (
            <SelectItem key={a} value={a}>
              {ASSEMBLY_LABEL[a]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.maker}
        onValueChange={(v) => onChange({ ...filters, maker: v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="ブランド" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべてのブランド</SelectItem>
          {makers.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="flex items-center gap-2 px-3 text-sm text-foreground/80">
        <Checkbox
          checked={filters.hasPhoto}
          onCheckedChange={(v) => onChange({ ...filters, hasPhoto: v === true })}
        />
        写真あり
      </label>
    </div>
  )
}
