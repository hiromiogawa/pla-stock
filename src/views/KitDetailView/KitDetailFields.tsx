import type { Kit, KitStock } from '~/entities/kit'

const ASSEMBLY_LABEL: Record<KitStock['assemblyStatus'], string> = {
  unbuilt: '未組立',
  building: '組立中',
  completed: '完成',
}

function FieldRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-border last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value ?? '—'}</dd>
    </div>
  )
}

export interface KitDetailFieldsProps {
  stock: KitStock
  kit: Kit
}

export function KitDetailFields({ stock, kit }: KitDetailFieldsProps) {
  return (
    <div className="space-y-4">
      {(stock.photoUrl || kit.boxArtUrl) && (
        <img
          src={stock.photoUrl ?? kit.boxArtUrl ?? ''}
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
          <FieldRow label="購入日" value={stock.purchasedAt} />
          <FieldRow
            label="購入価格"
            value={
              stock.purchasePriceYen != null
                ? `¥${stock.purchasePriceYen.toLocaleString()}`
                : null
            }
          />
          <FieldRow label="購入場所" value={stock.purchaseLocation} />
          <FieldRow label="組立状態" value={ASSEMBLY_LABEL[stock.assemblyStatus]} />
          <FieldRow label="メモ" value={stock.remark} />
        </dl>
      </section>
    </div>
  )
}
