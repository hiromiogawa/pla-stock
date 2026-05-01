import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormLabel from '@mui/material/FormLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import { Button } from '~/shared/ui/button'

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

export function PaintPurchaseDialog({
  open,
  paintLabel,
  onOpenChange,
  onConfirm,
}: PaintPurchaseDialogProps) {
  const [values, setValues] = useState<PaintPurchaseValues>({
    purchasedAt: null,
    priceYen: null,
    purchaseLocation: null,
    note: null,
  })

  const handleConfirm = async () => {
    await onConfirm(values)
    setValues({ purchasedAt: null, priceYen: null, purchaseLocation: null, note: null })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
      <DialogTitle>購入記録を追加</DialogTitle>
      <DialogContent>
        <DialogContentText>「{paintLabel}」を 1 本購入して在庫に追加します。</DialogContentText>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <FormLabel htmlFor="purchasedAt">購入日</FormLabel>
            <OutlinedInput
              id="purchasedAt"
              type="date"
              value={values.purchasedAt ?? ''}
              onChange={(event) =>
                setValues({ ...values, purchasedAt: event.target.value || null })
              }
              size="small"
              fullWidth
            />
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="priceYen">購入価格 (円)</FormLabel>
            <OutlinedInput
              id="priceYen"
              type="number"
              inputProps={{ inputMode: 'numeric' }}
              value={values.priceYen ?? ''}
              onChange={(event) =>
                setValues({
                  ...values,
                  priceYen: event.target.value === '' ? null : Number(event.target.value),
                })
              }
              size="small"
              fullWidth
            />
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="purchaseLocation">購入場所</FormLabel>
            <OutlinedInput
              id="purchaseLocation"
              value={values.purchaseLocation ?? ''}
              onChange={(event) =>
                setValues({ ...values, purchaseLocation: event.target.value || null })
              }
              placeholder="ヨドバシ梅田 / Amazon など"
              size="small"
              fullWidth
            />
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
        <Button onClick={handleConfirm}>購入記録を追加</Button>
      </DialogActions>
    </Dialog>
  )
}
