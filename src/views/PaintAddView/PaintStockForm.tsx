import { useForm } from '@tanstack/react-form'
import type { Paint } from '~/entities/paint'
import { paintStockSchema, type PaintStockInput } from '~/features/paint-stock-add'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import { Textarea } from '~/shared/ui/textarea'

export interface PaintStockFormProps {
  paint: Paint
  onSubmit: (values: PaintStockInput) => void | Promise<void>
  onCancel: () => void
}

export function PaintStockForm({ paint, onSubmit, onCancel }: PaintStockFormProps) {
  const form = useForm({
    defaultValues: {
      purchasedAt: '',
      purchasePriceYen: '' as string | number | null,
      remark: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = paintStockSchema.parse({
        purchasedAt: value.purchasedAt === '' ? null : value.purchasedAt,
        purchasePriceYen:
          value.purchasePriceYen === '' || value.purchasePriceYen === null
            ? null
            : Number(value.purchasePriceYen),
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
          {paint.brand} {paint.code} {paint.name} を自分の在庫に追加します。状態は「新品」で登録されます。
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
