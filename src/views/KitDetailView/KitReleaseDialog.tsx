import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { KIT_EVENT_REASON_LABELS, type KitEventReason } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { FormSelect } from '~/shared/ui/FormSelect'
import { FormTextField } from '~/shared/ui/FormTextField'

type ReleaseReason = Exclude<KitEventReason, 'purchase' | 'project'>

// 在庫を「手放す」操作で選べる reason の subset。
// ADR-0005 の規約: 同 subset を 2 箇所以上で使うようになったら entity 側に昇格。
const RELEASE_REASONS = ['gift', 'sell', 'discard', 'other'] as const satisfies readonly [
  ReleaseReason,
  ...ReleaseReason[],
]

const REASON_OPTIONS = RELEASE_REASONS.map((value) => ({
  value,
  label: KIT_EVENT_REASON_LABELS[value],
}))

const kitReleaseSchema = z.object({
  reason: z.enum(RELEASE_REASONS),
  note: z.string().max(2000).optional().nullable(),
})

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

interface KitReleaseFormDefaults {
  reason: ReleaseReason
  note: string
}

const KIT_RELEASE_FORM_DEFAULTS: KitReleaseFormDefaults = {
  reason: 'sell',
  note: '',
}

export function KitReleaseDialog({
  open,
  kitName,
  onOpenChange,
  onConfirm,
}: KitReleaseDialogProps) {
  const form = useForm({
    defaultValues: KIT_RELEASE_FORM_DEFAULTS,
    onSubmit: async ({ value }) => {
      const parsed = kitReleaseSchema.parse({
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
          <DialogContentText>「{kitName}」を 1 個手放します。在庫が 1 減ります。</DialogContentText>
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
