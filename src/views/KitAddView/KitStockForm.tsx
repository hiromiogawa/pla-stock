import { useForm } from '@tanstack/react-form'
import type { Kit } from '~/entities/kit'
import { purchaseEventSchema, type PurchaseEventInput } from '~/features/kit-stock-add'
import { Button } from '~/shared/ui/button'
import { FormTextField } from '~/shared/ui/FormTextField'

interface KitStockFormProps {
  kit: Kit
  onSubmit: (values: PurchaseEventInput) => void | Promise<void>
  onCancel: () => void
}

export function KitStockForm({ kit, onSubmit, onCancel }: KitStockFormProps) {
  const form = useForm({
    defaultValues: {
      purchasedAt: '',
      purchasePriceYen: '' as string | number | null,
      purchaseLocation: '',
      note: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = purchaseEventSchema.parse({
        purchasedAt: value.purchasedAt === '' ? null : value.purchasedAt,
        purchasePriceYen:
          value.purchasePriceYen === '' || value.purchasePriceYen === null
            ? null
            : Number(value.purchasePriceYen),
        purchaseLocation: value.purchaseLocation === '' ? null : value.purchaseLocation,
        note: value.note === '' ? null : value.note,
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
        <h2 className="text-sm font-semibold">購入記録を追加</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {kit.name}（{kit.grade} · {kit.scale}）の購入記録を追加して在庫に +1 します。
        </p>
      </div>

      <form.Field name="purchasedAt">
        {(field) => <FormTextField field={field} label="購入日" type="date" />}
      </form.Field>

      <form.Field name="purchasePriceYen">
        {(field) => (
          <FormTextField field={field} label="購入価格 (円)" type="number" inputMode="numeric" />
        )}
      </form.Field>

      <form.Field name="purchaseLocation">
        {(field) => (
          <FormTextField field={field} label="購入場所" placeholder="ヨドバシ梅田 / Amazon など" />
        )}
      </form.Field>

      <form.Field name="note">
        {(field) => <FormTextField field={field} label="メモ" multiline rows={3} />}
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
