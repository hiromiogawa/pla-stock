import { useState } from 'react'
import type { PaintEventReason } from '~/entities/paint'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/ui/select'
import { Textarea } from '~/shared/ui/textarea'

type ReleaseReason = Exclude<PaintEventReason, 'purchase'>

const REASON_OPTIONS: Array<{ value: ReleaseReason; label: string }> = [
  { value: 'discard', label: '廃棄（使い切り）' },
  { value: 'sell', label: '売却' },
  { value: 'gift', label: '譲渡' },
  { value: 'lost', label: '紛失' },
  { value: 'other', label: 'その他' },
]

export interface PaintReleaseValues {
  reason: ReleaseReason
  note: string | null
}

export interface PaintReleaseDialogProps {
  open: boolean
  paintLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: (values: PaintReleaseValues) => void | Promise<void>
}

export function PaintReleaseDialog({
  open,
  paintLabel,
  onOpenChange,
  onConfirm,
}: PaintReleaseDialogProps) {
  const [values, setValues] = useState<PaintReleaseValues>({
    reason: 'discard',
    note: null,
  })

  const handleConfirm = async () => {
    await onConfirm(values)
    setValues({ reason: 'discard', note: null })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>手放し記録を追加</DialogTitle>
          <DialogDescription>
            「{paintLabel}」を 1 本手放します。在庫が 1 減ります。
          </DialogDescription>
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
