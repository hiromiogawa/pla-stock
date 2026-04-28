import { useState } from 'react'
import type { KitEventReason } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/shared/ui/dialog'
import { Label } from '~/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/shared/ui/select'
import { Textarea } from '~/shared/ui/textarea'

type ReleaseReason = Exclude<KitEventReason, 'purchase' | 'project'>

const REASON_OPTIONS: Array<{ value: ReleaseReason; label: string }> = [
  { value: 'gift', label: '譲渡' },
  { value: 'sell', label: '売却' },
  { value: 'discard', label: '廃棄' },
  { value: 'other', label: 'その他' },
]

export interface KitReleaseValues {
  reason: ReleaseReason
  note: string | null
}

interface KitReleaseDialogProps {
  open: boolean
  kitName: string
  onOpenChange: (open: boolean) => void
  onConfirm: (values: KitReleaseValues) => void | Promise<void>
}

export function KitReleaseDialog({
  open,
  kitName,
  onOpenChange,
  onConfirm,
}: KitReleaseDialogProps) {
  const [values, setValues] = useState<KitReleaseValues>({
    reason: 'sell',
    note: null,
  })

  const handleConfirm = async () => {
    await onConfirm(values)
    setValues({ reason: 'sell', note: null })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>手放し記録を追加</DialogTitle>
          <DialogDescription>「{kitName}」を 1 個手放します。在庫が 1 減ります。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">理由</Label>
            <Select
              value={values.reason}
              onValueChange={(v) => setValues({ ...values, reason: v as ReleaseReason })}
            >
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">メモ</Label>
            <Textarea
              id="note"
              rows={2}
              value={values.note ?? ''}
              onChange={(e) => setValues({ ...values, note: e.target.value || null })}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            手放しを記録
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
