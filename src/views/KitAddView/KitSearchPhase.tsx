import { useMemo, useState } from 'react'
import type { Kit } from '~/entities/kit'
import { Input } from '~/shared/ui/input'
import { KitMasterCandidate } from './KitMasterCandidate'

interface KitSearchPhaseProps {
  kits: Kit[]
  onSelectMaster: (kit: Kit) => void
}

export function KitSearchPhase({ kits, onSelectMaster }: KitSearchPhaseProps) {
  const [query, setQuery] = useState('')

  const candidates = useMemo<Kit[]>(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return []
    return kits.filter((k) => k.name.toLowerCase().includes(q)).slice(0, 20)
  }, [kits, query])

  function renderResults() {
    if (query.trim() === '') {
      return (
        <p className="text-sm text-muted-foreground">
          キーワードを入力してマスターから検索してください。
        </p>
      )
    }
    if (candidates.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          「{query}」に一致するキットが見つかりませんでした。マスターに無いキットは admin
          に申請してください (Phase E 以降の機能)。
        </p>
      )
    }
    return (
      <ul className="space-y-2">
        {candidates.map((kit) => (
          <li key={kit.id}>
            <KitMasterCandidate kit={kit} onSelect={() => onSelectMaster(kit)} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キット名で検索 (例: RX-78-2, Sazabi)"
          autoFocus
        />
        {renderResults()}
      </div>
    </div>
  )
}
