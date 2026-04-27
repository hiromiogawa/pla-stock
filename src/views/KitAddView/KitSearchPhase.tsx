import { useMemo, useState } from 'react'
import type { Kit } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { KitMasterCandidate } from './KitMasterCandidate'

export interface KitSearchPhaseProps {
  kits: Kit[]
  onSelectMaster: (kit: Kit) => void
  onCreatePrivate: () => void
}

export function KitSearchPhase({ kits, onSelectMaster, onCreatePrivate }: KitSearchPhaseProps) {
  const [query, setQuery] = useState('')

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return [] as Kit[]
    return kits
      .filter((k) => k.name.toLowerCase().includes(q))
      .slice(0, 20)
  }, [kits, query])

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
        {query.trim() === '' ? (
          <p className="text-sm text-muted-foreground">
            キーワードを入力してマスターから検索してください。
          </p>
        ) : candidates.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              「{query}」に一致するキットが見つかりませんでした。
            </p>
            <Button onClick={onCreatePrivate}>private item として追加</Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {candidates.map((kit) => (
              <li key={kit.id}>
                <KitMasterCandidate kit={kit} onSelect={() => onSelectMaster(kit)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {query.trim() !== '' && candidates.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          目的のキットがマスターに無い場合は{' '}
          <button
            type="button"
            onClick={onCreatePrivate}
            className="underline text-foreground hover:text-foreground/80"
          >
            private item として追加
          </button>
        </div>
      )}
    </div>
  )
}
