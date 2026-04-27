import { useMemo, useState } from 'react'
import type { Paint } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/shared/ui/dialog'

export interface AddPaintDialogProps {
  open: boolean
  candidates: Paint[]
  onOpenChange: (open: boolean) => void
  onSelect: (paintId: string) => void | Promise<void>
}

export function AddPaintDialog({ open, candidates, onOpenChange, onSelect }: AddPaintDialogProps) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return candidates.slice(0, 30)
    return candidates
      .filter(
        (p) =>
          p.brand.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q),
      )
      .slice(0, 30)
  }, [candidates, query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>塗料を追加</DialogTitle>
          <DialogDescription>
            このプロジェクトで使う塗料を選択してください。在庫の count は変化しません。
          </DialogDescription>
        </DialogHeader>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ブランド / コード / 名前で検索"
          autoFocus
        />
        <div className="overflow-y-auto flex-1 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">候補なし</p>
          ) : (
            filtered.map((paint) => (
              <button
                key={paint.id}
                type="button"
                onClick={() => void onSelect(paint.id)}
                className="w-full text-left rounded-md border border-border p-2 hover:bg-accent"
              >
                <div className="text-sm font-medium">
                  {paint.brand} {paint.code} {paint.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {paint.colorFamily ?? '—'} · {paint.finishType ?? '—'}
                </div>
              </button>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
