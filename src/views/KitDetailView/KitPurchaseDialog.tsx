import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import { Textarea } from '~/shared/ui/textarea'

export interface KitPurchaseValues {
  purchasedAt: string | null
  priceYen: number | null
  purchaseLocation: string | null
  note: string | null
}

interface KitPurchaseDialogProps {
  open: boolean
  kitName: string
  onOpenChange: (open: boolean) => void
  onConfirm: (values: KitPurchaseValues) => void | Promise<void>
}

export function KitPurchaseDialog({
  open,
  kitName,
  onOpenChange,
  onConfirm,
}: KitPurchaseDialogProps) {
  const [values, setValues] = useState<KitPurchaseValues>({
    purchasedAt: null,
    priceYen: null,
    purchaseLocation: null,
    note: null,
  })

  const handleConfirm = async () => {
    await onConfirm(values)
    // reset
    setValues({ purchasedAt: null, priceYen: null, purchaseLocation: null, note: null })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
      <DialogTitle>購入記録を追加</DialogTitle>
      <DialogContent>
        <DialogContentText>「{kitName}」を 1 個購入して在庫に追加します。</DialogContentText>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="purchasedAt">購入日</Label>
            <Input
              id="purchasedAt"
              type="date"
              value={values.purchasedAt ?? ''}
              onChange={(event) =>
                setValues({ ...values, purchasedAt: event.target.value || null })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceYen">購入価格 (円)</Label>
            <Input
              id="priceYen"
              type="number"
              inputMode="numeric"
              value={values.priceYen ?? ''}
              onChange={(event) =>
                setValues({
                  ...values,
                  priceYen: event.target.value === '' ? null : Number(event.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseLocation">購入場所</Label>
            <Input
              id="purchaseLocation"
              value={values.purchaseLocation ?? ''}
              onChange={(event) =>
                setValues({ ...values, purchaseLocation: event.target.value || null })
              }
              placeholder="ヨドバシ梅田 / Amazon など"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">メモ</Label>
            <Textarea
              id="note"
              rows={2}
              value={values.note ?? ''}
              onChange={(event) => setValues({ ...values, note: event.target.value || null })}
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
