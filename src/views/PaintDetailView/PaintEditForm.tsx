import { useState } from 'react'
import type { PaintStock, PaintStatus } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import { Textarea } from '~/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/ui/select'

const STATUS_OPTIONS: Array<{ value: PaintStatus; label: string }> = [
  { value: 'new', label: '新品' },
  { value: 'in_use', label: '使用中' },
  { value: 'empty', label: '空' },
]

export type PaintEditValues = Pick<
  PaintStock,
  'status' | 'remark' | 'purchasedAt' | 'purchasePriceYen'
>

export interface PaintEditFormProps {
  stock: PaintStock
  onSave: (values: PaintEditValues) => void | Promise<void>
  onCancel: () => void
}

export function PaintEditForm({ stock, onSave, onCancel }: PaintEditFormProps) {
  const [values, setValues] = useState<PaintEditValues>({
    status: stock.status,
    remark: stock.remark,
    purchasedAt: stock.purchasedAt,
    purchasePriceYen: stock.purchasePriceYen,
  })

  return (
    <form
      className="rounded-lg border border-border bg-card p-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        void onSave(values)
      }}
    >
      <h2 className="text-sm font-semibold">在庫情報を編集</h2>

      <div className="space-y-2">
        <Label htmlFor="status">状態</Label>
        <Select
          value={values.status}
          onValueChange={(v) => setValues({ ...values, status: v as PaintStatus })}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
        <Label htmlFor="purchasePriceYen">購入価格 (円)</Label>
        <Input
          id="purchasePriceYen"
          type="number"
          inputMode="numeric"
          value={values.purchasePriceYen ?? ''}
          onChange={(e) =>
            setValues({
              ...values,
              purchasePriceYen: e.target.value === '' ? null : Number(e.target.value),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remark">メモ</Label>
        <Textarea
          id="remark"
          rows={3}
          value={values.remark ?? ''}
          onChange={(e) => setValues({ ...values, remark: e.target.value || null })}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">保存</Button>
      </div>
    </form>
  )
}
