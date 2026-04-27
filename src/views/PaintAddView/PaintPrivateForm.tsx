import { useForm } from '@tanstack/react-form'
import type { ColorFamily, FinishType } from '~/entities/paint'
import {
  privatePaintSchema,
  paintStockSchema,
  type PrivatePaintInput,
  type PaintStockInput,
} from '~/features/paint-stock-add'
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

const COLOR_FAMILIES: Array<ColorFamily | '__none__'> = [
  '__none__',
  '赤',
  '青',
  '黄',
  '緑',
  '白',
  '黒',
  '銀',
  '金',
  '茶',
  '蛍光',
  'クリア',
  'other',
]

const FINISH_TYPES: Array<FinishType | '__none__'> = [
  '__none__',
  '光沢',
  '半光沢',
  'つや消し',
  'メタリック',
  'パール',
  'クリア',
  'プライマー',
  'ウェザリング',
]

const COLOR_LABEL = (v: ColorFamily | '__none__') =>
  v === '__none__' ? '未設定' : v
const FINISH_LABEL = (v: FinishType | '__none__') =>
  v === '__none__' ? '未設定' : v

export interface PaintPrivateFormProps {
  onSubmit: (
    privateInput: PrivatePaintInput,
    stockInput: PaintStockInput,
  ) => void | Promise<void>
  onCancel: () => void
}

export function PaintPrivateForm({ onSubmit, onCancel }: PaintPrivateFormProps) {
  const form = useForm({
    defaultValues: {
      brand: '',
      code: '',
      name: '',
      colorFamily: '__none__' as ColorFamily | '__none__',
      finishType: '__none__' as FinishType | '__none__',
      purchasedAt: '',
      purchasePriceYen: '' as string | number | null,
      remark: '',
    },
    onSubmit: async ({ value }) => {
      const privateInput = privatePaintSchema.parse({
        brand: value.brand,
        code: value.code,
        name: value.name,
        colorFamily: value.colorFamily === '__none__' ? null : value.colorFamily,
        finishType: value.finishType === '__none__' ? null : value.finishType,
      })
      const stockInput = paintStockSchema.parse({
        purchasedAt: value.purchasedAt === '' ? null : value.purchasedAt,
        purchasePriceYen:
          value.purchasePriceYen === '' || value.purchasePriceYen === null
            ? null
            : Number(value.purchasePriceYen),
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
          マスターに無い塗料を自分のアカウントだけに登録します。
        </p>
      </div>

      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">マスター情報</h3>

      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="brand"
          validators={{
            onChange: ({ value }) =>
              value.trim() === '' ? 'ブランドは必須' : value.length > 100 ? '100 文字以内' : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>ブランド *</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="例: Mr.Color"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>
        <form.Field
          name="code"
          validators={{
            onChange: ({ value }) =>
              value.trim() === '' ? 'コードは必須' : value.length > 50 ? '50 文字以内' : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>コード *</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="例: C1"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

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
              placeholder="例: ホワイト"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="colorFamily">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>色系統</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as ColorFamily | '__none__')}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_FAMILIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {COLOR_LABEL(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
        <form.Field name="finishType">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>フィニッシュ</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as FinishType | '__none__')}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FINISH_TYPES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {FINISH_LABEL(f)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </div>

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
