import type { Paint, PaintStock, PaintEvent } from '~/entities/paint'

const REASON_LABEL: Record<PaintEvent['reason'], string> = {
  purchase: '購入',
  gift: '贈り物',
  sell: '売却',
  discard: '廃棄',
  lost: '紛失',
  other: 'その他',
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
  events: PaintEvent[]
}

export function PaintDetailFields({ stock, paint, events }: PaintDetailFieldsProps) {
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
          <FieldRow label="現在の在庫数" value={`${stock.count} 本`} />
        </dl>
      </section>
      {events.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">入出庫履歴</h2>
          <ul className="space-y-2">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-start gap-3 text-sm">
                <span
                  className={`shrink-0 font-semibold tabular-nums ${ev.delta > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {ev.delta > 0 ? `+${ev.delta}` : ev.delta}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-muted-foreground">{REASON_LABEL[ev.reason]}</span>
                  {ev.priceYen != null && (
                    <span className="ml-2 text-muted-foreground">
                      ¥{ev.priceYen.toLocaleString()}
                    </span>
                  )}
                  {ev.purchaseLocation && (
                    <span className="ml-2 text-muted-foreground">@ {ev.purchaseLocation}</span>
                  )}
                  {ev.note && (
                    <p className="text-xs text-muted-foreground mt-0.5">{ev.note}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {ev.purchasedAt ?? ev.createdAt.slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
