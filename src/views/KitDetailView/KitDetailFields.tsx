import type { Kit, KitStock, KitEvent } from '~/entities/kit'

function FieldRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-border last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value ?? '—'}</dd>
    </div>
  )
}

const REASON_LABEL: Record<KitEvent['reason'], string> = {
  purchase: '購入',
  project: 'プロジェクト',
  gift: '贈り物',
  sell: '売却',
  discard: '廃棄',
  other: 'その他',
}

interface KitDetailFieldsProps {
  stock: KitStock
  kit: Kit
  events: KitEvent[]
}

export function KitDetailFields({ stock, kit, events }: KitDetailFieldsProps) {
  return (
    <div className="space-y-4">
      {kit.boxArtUrl && (
        <img
          src={kit.boxArtUrl}
          alt={kit.name}
          className="w-full max-w-sm rounded-lg border border-border"
        />
      )}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold mb-2">マスター情報</h2>
        <dl>
          <FieldRow label="名前" value={kit.name} />
          <FieldRow label="グレード" value={kit.grade} />
          <FieldRow label="スケール" value={kit.scale} />
          <FieldRow label="メーカー" value={kit.maker} />
          <FieldRow
            label="定価"
            value={kit.retailPriceYen != null ? `¥${kit.retailPriceYen.toLocaleString()}` : null}
          />
          <FieldRow label="JAN コード" value={kit.janCode} />
        </dl>
      </section>
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold mb-2">在庫情報</h2>
        <dl>
          <FieldRow label="現在の在庫数" value={`${stock.count} 個`} />
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
                  {ev.note && <p className="text-xs text-muted-foreground mt-0.5">{ev.note}</p>}
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
