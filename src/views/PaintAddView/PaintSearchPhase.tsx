import { useMemo, useState } from 'react'
import type { Paint } from '~/entities/paint'
import { Input } from '~/shared/ui/input'
import { PaintMasterCandidate } from './PaintMasterCandidate'

interface PaintSearchPhaseProps {
  paints: Paint[]
  onSelectMaster: (paint: Paint) => void
}

export function PaintSearchPhase({ paints, onSelectMaster }: PaintSearchPhaseProps) {
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
          <p className="text-sm text-muted-foreground">
            「{query}」に一致する塗料が見つかりませんでした。マスターに無い塗料は admin
            に申請してください (Phase E 以降の機能)。
          </p>
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
    </div>
  )
}
