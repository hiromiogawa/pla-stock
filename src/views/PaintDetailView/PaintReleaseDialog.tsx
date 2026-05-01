import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select from '@mui/material/Select'
import type { PaintEventReason } from '~/entities/paint'
import { Button } from '~/shared/ui/button'

type ReleaseReason = Exclude<PaintEventReason, 'purchase'>

const REASON_OPTIONS: Array<{ value: ReleaseReason; label: string }> = [
  { value: 'discard', label: '廃棄（使い切り）' },
  { value: 'sell', label: '売却' },
  { value: 'gift', label: '譲渡' },
  { value: 'lost', label: '紛失' },
  { value: 'other', label: 'その他' },
]

/** runtime narrowing: 想定外の値が来たら 'discard' に fallback */
function toReleaseReason(value: string): ReleaseReason {
  for (const option of REASON_OPTIONS) {
    if (option.value === value) return option.value
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
            <FormLabel htmlFor="reason">理由</FormLabel>
            <FormControl fullWidth size="small">
              <Select<ReleaseReason>
                id="reason"
                value={values.reason}
                onChange={(event) =>
                  setValues({ ...values, reason: toReleaseReason(String(event.target.value)) })
                }
              >
                {REASON_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="note">メモ</FormLabel>
            <OutlinedInput
              id="note"
              multiline
              rows={2}
              value={values.note ?? ''}
              onChange={(event) => setValues({ ...values, note: event.target.value || null })}
              size="small"
              fullWidth
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
