import { useState } from 'react'
import type { KitStock, AssemblyStatus } from '~/entities/kit'
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

const ASSEMBLY_OPTIONS: Array<{ value: AssemblyStatus; label: string }> = [
  { value: 'unbuilt', label: '未組立' },
  { value: 'building', label: '組立中' },
  { value: 'completed', label: '完成' },
]

export type KitEditValues = Pick<
  KitStock,
  'assemblyStatus' | 'remark' | 'purchasedAt' | 'purchasePriceYen' | 'purchaseLocation'
>

export interface KitEditFormProps {
  stock: KitStock
  onSave: (values: KitEditValues) => void | Promise<void>
  onCancel: () => void
}

export function KitEditForm({ stock, onSave, onCancel }: KitEditFormProps) {
  const [values, setValues] = useState<KitEditValues>({
    assemblyStatus: stock.assemblyStatus,
    remark: stock.remark,
    purchasedAt: stock.purchasedAt,
    purchasePriceYen: stock.purchasePriceYen,
    purchaseLocation: stock.purchaseLocation,
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
        <Label htmlFor="assemblyStatus">組立状態</Label>
        <Select
          value={values.assemblyStatus}
          onValueChange={(v) =>
            setValues({ ...values, assemblyStatus: v as AssemblyStatus })
          }
        >
          <SelectTrigger id="assemblyStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSEMBLY_OPTIONS.map((o) => (
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
        <Label htmlFor="purchaseLocation">購入場所</Label>
        <Input
          id="purchaseLocation"
          value={values.purchaseLocation ?? ''}
          onChange={(e) => setValues({ ...values, purchaseLocation: e.target.value || null })}
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
