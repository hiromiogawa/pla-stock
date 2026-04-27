import type { Paint, PaintStock } from '~/entities/paint'

const STATUS_LABEL: Record<PaintStock['status'], string> = {
  new: '新品',
  in_use: '使用中',
  empty: '空',
}

function FieldRow({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-border last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value ?? '—'}</dd>
    </div>
  )
}

export interface PaintDetailFieldsProps {
  stock: PaintStock
  paint: Paint
}

export function PaintDetailFields({ stock, paint }: PaintDetailFieldsProps) {
  return (
    <div className="space-y-4">
      {paint.swatchUrl && (
        <img
          src={paint.swatchUrl}
          alt={paint.name}
          className="w-full max-w-sm rounded-lg border border-border"
        />
      )}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold mb-2">マスター情報</h2>
        <dl>
          <FieldRow label="ブランド" value={paint.brand} />
          <FieldRow label="コード" value={paint.code} />
          <FieldRow label="名前" value={paint.name} />
          <FieldRow label="色系統" value={paint.colorFamily} />
          <FieldRow label="フィニッシュ" value={paint.finishType} />
        </dl>
      </section>
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold mb-2">在庫情報</h2>
        <dl>
          <FieldRow label="購入日" value={stock.purchasedAt} />
          <FieldRow
            label="購入価格"
            value={
              stock.purchasePriceYen != null
                ? `¥${stock.purchasePriceYen.toLocaleString()}`
                : null
            }
          />
          <FieldRow label="状態" value={STATUS_LABEL[stock.status]} />
          <FieldRow label="メモ" value={stock.remark} />
        </dl>
      </section>
    </div>
  )
}
