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
import type { KitEventReason } from '~/entities/kit'
import { Button } from '~/shared/ui/button'

type ReleaseReason = Exclude<KitEventReason, 'purchase' | 'project'>

const REASON_OPTIONS: Array<{ value: ReleaseReason; label: string }> = [
  { value: 'gift', label: '譲渡' },
  { value: 'sell', label: '売却' },
  { value: 'discard', label: '廃棄' },
  { value: 'other', label: 'その他' },
]

/** runtime narrowing: 想定外の値が来たら 'sell' に fallback */
function toReleaseReason(value: string): ReleaseReason {
  for (const option of REASON_OPTIONS) {
    if (option.value === value) return option.value
  }
  return 'sell'
}

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
    <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
      <DialogTitle>手放し記録を追加</DialogTitle>
      <DialogContent>
        <DialogContentText>「{kitName}」を 1 個手放します。在庫が 1 減ります。</DialogContentText>
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
