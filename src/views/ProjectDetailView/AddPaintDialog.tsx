import { useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import type { Paint } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'

interface AddPaintDialogProps {
  open: boolean
  candidates: Paint[]
  onOpenChange: (open: boolean) => void
  onSelect: (paintId: string) => void | Promise<void>
}

export function AddPaintDialog({ open, candidates, onOpenChange, onSelect }: AddPaintDialogProps) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (normalized === '') return candidates.slice(0, 30)
    return candidates
      .filter(
        (paint) =>
          paint.brand.toLowerCase().includes(normalized) ||
          paint.code.toLowerCase().includes(normalized) ||
          paint.name.toLowerCase().includes(normalized),
      )
      .slice(0, 30)
  }, [candidates, query])

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { maxHeight: '80vh' } }}
    >
      <DialogTitle>塗料を追加</DialogTitle>
      <DialogContent>
        <DialogContentText>
          このプロジェクトで使う塗料を選択してください。在庫の count は変化しません。
        </DialogContentText>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
      </DialogContent>
      <DialogActions>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          キャンセル
        </Button>
      </DialogActions>
    </Dialog>
  )
}
