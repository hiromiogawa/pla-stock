import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useForm } from '@tanstack/react-form'
import { paintPurchaseEventSchema } from '~/features/paint-stock-add'
import { Button } from '~/shared/ui/button'
import { FormTextField } from '~/shared/ui/FormTextField'

export interface PaintPurchaseValues {
  purchasedAt: string | null
  priceYen: number | null
  purchaseLocation: string | null
  note: string | null
}

interface PaintPurchaseDialogProps {
  open: boolean
  paintLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: (values: PaintPurchaseValues) => void | Promise<void>
}

interface PaintPurchaseFormDefaults {
  purchasedAt: string
  purchasePriceYen: string | number | null
  purchaseLocation: string
  note: string
}

const PAINT_PURCHASE_FORM_DEFAULTS: PaintPurchaseFormDefaults = {
  purchasedAt: '',
  purchasePriceYen: '',
  purchaseLocation: '',
  note: '',
}

export function PaintPurchaseDialog({
  open,
  paintLabel,
  onOpenChange,
  onConfirm,
}: PaintPurchaseDialogProps) {
  const form = useForm({
    defaultValues: PAINT_PURCHASE_FORM_DEFAULTS,
    onSubmit: async ({ value }) => {
      const parsed = paintPurchaseEventSchema.parse({
        purchasedAt: value.purchasedAt === '' ? null : value.purchasedAt,
        purchasePriceYen:
          value.purchasePriceYen === '' || value.purchasePriceYen === null
            ? null
            : Number(value.purchasePriceYen),
        purchaseLocation: value.purchaseLocation === '' ? null : value.purchaseLocation,
        note: value.note === '' ? null : value.note,
      })
      await onConfirm({
        purchasedAt: parsed.purchasedAt ?? null,
        priceYen: parsed.purchasePriceYen ?? null,
        purchaseLocation: parsed.purchaseLocation ?? null,
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
      <DialogTitle>購入記録を追加</DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <DialogContent>
          <DialogContentText>「{paintLabel}」を 1 本購入して在庫に追加します。</DialogContentText>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <form.Field name="purchasedAt">
              {(field) => <FormTextField field={field} label="購入日" type="date" />}
            </form.Field>
            <form.Field name="purchasePriceYen">
              {(field) => (
                <FormTextField
                  field={field}
                  label="購入価格 (円)"
                  type="number"
                  inputMode="numeric"
                />
              )}
            </form.Field>
            <form.Field name="purchaseLocation">
              {(field) => (
                <FormTextField
                  field={field}
                  label="購入場所"
                  placeholder="ヨドバシ梅田 / Amazon など"
                />
              )}
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
          <Button type="submit">購入記録を追加</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
