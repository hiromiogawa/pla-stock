import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { PaintEventReason } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { Label } from '~/shared/ui/label'
import { Textarea } from '~/shared/ui/textarea'

type ReleaseReason = Exclude<PaintEventReason, 'purchase'>

const REASON_OPTIONS: Array<{ value: ReleaseReason; label: string }> = [
  { value: 'discard', label: '廃棄（使い切り）' },
  { value: 'sell', label: '売却' },
  { value: 'gift', label: '譲渡' },
  { value: 'lost', label: '紛失' },
  { value: 'other', label: 'その他' },
]

/** runtime narrowing: 想定外の値が来たら 'discard' に fallback */
function toReleaseReason(v: string): ReleaseReason {
  for (const o of REASON_OPTIONS) {
    if (o.value === v) return o.value
  }
  return 'discard'
}

export interface PaintReleaseValues {
  reason: ReleaseReason
  note: string | null
}

interface PaintReleaseDialogProps {
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
    <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
      <DialogTitle>手放し記録を追加</DialogTitle>
      <DialogContent>
        <DialogContentText>
          「{paintLabel}」を 1 本手放します。在庫が 1 減ります。
        </DialogContentText>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">理由</Label>
            <FormControl fullWidth size="small">
              <Select<ReleaseReason>
                id="reason"
                value={values.reason}
                onChange={(e) =>
                  setValues({ ...values, reason: toReleaseReason(String(e.target.value)) })
                }
              >
                {REASON_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
      </DialogContent>
      <DialogActions>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          キャンセル
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          手放しを記録
        </Button>
      </DialogActions>
    </Dialog>
  )
}
