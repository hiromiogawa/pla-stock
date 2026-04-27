import { useForm } from '@tanstack/react-form'
import type { Kit } from '~/entities/kit'
import { stockSchema, type StockInput } from '~/features/kit-stock-add'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import { Textarea } from '~/shared/ui/textarea'

export interface KitStockFormProps {
  kit: Kit
  onSubmit: (values: StockInput) => void | Promise<void>
  onCancel: () => void
}

export function KitStockForm({ kit, onSubmit, onCancel }: KitStockFormProps) {
  const form = useForm({
    defaultValues: {
      purchasedAt: '',
      purchasePriceYen: '' as string | number | null,
      purchaseLocation: '',
      remark: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = stockSchema.parse({
        purchasedAt: value.purchasedAt === '' ? null : value.purchasedAt,
        purchasePriceYen:
          value.purchasePriceYen === '' || value.purchasePriceYen === null
            ? null
            : Number(value.purchasePriceYen),
        purchaseLocation: value.purchaseLocation === '' ? null : value.purchaseLocation,
        remark: value.remark === '' ? null : value.remark,
      })
      await onSubmit(parsed)
    },
  })

  return (
    <form
      className="rounded-lg border border-border bg-card p-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div>
        <h2 className="text-sm font-semibold">在庫に追加</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {kit.name}（{kit.grade} · {kit.scale}）を自分の在庫に追加します。
        </p>
      </div>

      <form.Field name="purchasedAt">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>購入日</Label>
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="purchasePriceYen">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>購入価格 (円)</Label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              inputMode="numeric"
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="purchaseLocation">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>購入場所</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="ヨドバシ梅田 / Amazon など"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="remark">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>メモ</Label>
            <Textarea
              id={field.name}
              name={field.name}
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">追加</Button>
      </div>
    </form>
  )
}
