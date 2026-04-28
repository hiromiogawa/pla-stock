import { useState } from 'react'
import { Button } from '~/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/shared/ui/dialog'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import { Textarea } from '~/shared/ui/textarea'

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>購入記録を追加</DialogTitle>
          <DialogDescription>「{paintLabel}」を 1 本購入して在庫に追加します。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="purchasedAt">購入日</Label>
            <Input
              id="purchasedAt"
              type="date"
              value={values.purchasedAt ?? ''}
              onChange={(e) => setValues({ ...values, purchasedAt: e.target.value || null })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceYen">購入価格 (円)</Label>
            <Input
              id="priceYen"
              type="number"
              inputMode="numeric"
              value={values.priceYen ?? ''}
              onChange={(e) =>
                setValues({
                  ...values,
                  priceYen: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseLocation">購入場所</Label>
            <Input
              id="purchaseLocation"
              value={values.purchaseLocation ?? ''}
              onChange={(e) => setValues({ ...values, purchaseLocation: e.target.value || null })}
              placeholder="ヨドバシ梅田 / Amazon など"
            />
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
          <Button onClick={handleConfirm}>購入記録を追加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
