import { useForm } from '@tanstack/react-form'
import type { Grade, Scale } from '~/entities/kit'
import {
  privateKitSchema,
  stockSchema,
  type PrivateKitInput,
  type StockInput,
} from '~/features/kit-stock-add'
import { Button } from '~/shared/ui/button'
import { Input } from '~/shared/ui/input'
import { Label } from '~/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/ui/select'
import { Textarea } from '~/shared/ui/textarea'

const GRADES: Grade[] = ['HG', 'RG', 'EG', 'MG', 'PG', 'other']
const SCALES: Scale[] = ['1/144', '1/100', '1/60', '1/48', 'other']

export interface KitPrivateFormProps {
  onSubmit: (privateInput: PrivateKitInput, stockInput: StockInput) => void | Promise<void>
  onCancel: () => void
}

export function KitPrivateForm({ onSubmit, onCancel }: KitPrivateFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      grade: 'HG' as Grade,
      scale: '1/144' as Scale,
      maker: 'Bandai',
      retailPriceYen: '' as string | number | null,
      purchasedAt: '',
      purchasePriceYen: '' as string | number | null,
      purchaseLocation: '',
      remark: '',
    },
    onSubmit: async ({ value }) => {
      const privateInput = privateKitSchema.parse({
        name: value.name,
        grade: value.grade,
        scale: value.scale,
        maker: value.maker,
        retailPriceYen:
          value.retailPriceYen === '' || value.retailPriceYen === null
            ? null
            : Number(value.retailPriceYen),
      })
      const stockInput = stockSchema.parse({
        purchasedAt: value.purchasedAt === '' ? null : value.purchasedAt,
        purchasePriceYen:
          value.purchasePriceYen === '' || value.purchasePriceYen === null
            ? null
            : Number(value.purchasePriceYen),
        purchaseLocation: value.purchaseLocation === '' ? null : value.purchaseLocation,
        remark: value.remark === '' ? null : value.remark,
      })
      await onSubmit(privateInput, stockInput)
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
        <h2 className="text-sm font-semibold">private item として追加</h2>
        <p className="text-xs text-muted-foreground mt-1">
          マスターに無いキットを自分のアカウントだけに登録します。
        </p>
      </div>

      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">マスター情報</h3>

      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            value.trim() === '' ? '名前は必須' : value.length > 200 ? '200 文字以内' : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>名前 *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="例: HG RX-78-2 Gundam"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="grade">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>グレード</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as Grade)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
        <form.Field name="scale">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>スケール</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as Scale)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCALES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </div>

      <form.Field
        name="maker"
        validators={{
          onChange: ({ value }) =>
            value.trim() === '' ? 'メーカーは必須' : value.length > 100 ? '100 文字以内' : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>メーカー *</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="retailPriceYen">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>定価 (円)</Label>
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

      <h3 className="text-xs uppercase tracking-wider text-muted-foreground pt-2">在庫情報</h3>

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
