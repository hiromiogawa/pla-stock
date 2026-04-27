import { useMemo, useState } from 'react'
import type { Paint } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { PaintMasterCandidate } from './PaintMasterCandidate'

export interface PaintSearchPhaseProps {
  paints: Paint[]
  onSelectMaster: (paint: Paint) => void
  onCreatePrivate: () => void
}

export function PaintSearchPhase({
  paints,
  onSelectMaster,
  onCreatePrivate,
}: PaintSearchPhaseProps) {
  const [query, setQuery] = useState('')

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return [] as Paint[]
    return paints
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        )
      })
      .slice(0, 30)
  }, [paints, query])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ブランド / コード / 名前で検索 (例: Mr.Color, C1, ホワイト)"
          autoFocus
        />
        {query.trim() === '' ? (
          <p className="text-sm text-muted-foreground">
            キーワードを入力してマスターから検索してください。
          </p>
        ) : candidates.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              「{query}」に一致する塗料が見つかりませんでした。
            </p>
            <Button onClick={onCreatePrivate}>private item として追加</Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {candidates.map((paint) => (
              <li key={paint.id}>
                <PaintMasterCandidate paint={paint} onSelect={() => onSelectMaster(paint)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {query.trim() !== '' && candidates.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          目的の塗料がマスターに無い場合は{' '}
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
