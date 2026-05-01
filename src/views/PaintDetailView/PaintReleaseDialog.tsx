import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import type { PaintEventReason } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import type { FormSelectOption } from '~/shared/ui/FormSelect'
import { FormSelect } from '~/shared/ui/FormSelect'
import { FormTextField } from '~/shared/ui/FormTextField'

type ReleaseReason = Exclude<PaintEventReason, 'purchase'>

const REASON_OPTIONS: FormSelectOption[] = [
  { value: 'discard', label: '廃棄（使い切り）' },
  { value: 'sell', label: '売却' },
  { value: 'gift', label: '譲渡' },
  { value: 'lost', label: '紛失' },
  { value: 'other', label: 'その他' },
]

const RELEASE_REASON_VALUES = [
  'discard',
  'sell',
  'gift',
  'lost',
  'other',
] as const satisfies readonly [ReleaseReason, ...ReleaseReason[]]

const paintReleaseSchema = z.object({
  reason: z.enum(RELEASE_REASON_VALUES),
  note: z.string().max(2000).optional().nullable(),
})

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

interface PaintReleaseFormDefaults {
  reason: ReleaseReason
  note: string
}

const PAINT_RELEASE_FORM_DEFAULTS: PaintReleaseFormDefaults = {
  reason: 'discard',
  note: '',
}

export function PaintReleaseDialog({
  open,
  paintLabel,
  onOpenChange,
  onConfirm,
}: PaintReleaseDialogProps) {
  const form = useForm({
    defaultValues: PAINT_RELEASE_FORM_DEFAULTS,
    onSubmit: async ({ value }) => {
      const parsed = paintReleaseSchema.parse({
        reason: value.reason,
        note: value.note === '' ? null : value.note,
      })
      await onConfirm({
        reason: parsed.reason,
        note: parsed.note ?? null,
      })
      form.reset()
      onOpenChange(false)
    },
  })

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>手放し記録を追加</DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <DialogContent>
          <DialogContentText>
            「{paintLabel}」を 1 本手放します。在庫が 1 減ります。
          </DialogContentText>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <form.Field name="reason">
              {(field) => <FormSelect field={field} label="理由" options={REASON_OPTIONS} />}
            </form.Field>
            <form.Field name="note">
              {(field) => <FormTextField field={field} label="メモ" multiline rows={2} />}
            </form.Field>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button type="submit" variant="destructive">
            手放しを記録
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
