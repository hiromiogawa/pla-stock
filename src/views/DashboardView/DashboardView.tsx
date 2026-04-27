import { getMockSession } from '~/shared/lib/mock-auth'

/**
 * Phase A-2 の Dashboard。
 * 統計は全部スタブ (0 固定)。Issue #12 で新 schema (count + event) から実数が入る。
 *
 * 新 schema で計算する値:
 *   在庫キット = SUM(kit_stocks.count)
 *   在庫塗料 = SUM(paint_stocks.count)
 *   製作中 = COUNT(projects WHERE status='building')
 *   完成済 = COUNT(projects WHERE status='completed')
 *   累計購入額 = SUM(priceYen FROM kit_events + paint_events WHERE reason='purchase')
 *   今月の購入額 = 上記を current month で filter
 */
const STUB_STATS = [
  { label: '在庫キット', value: 0, unit: '個' },
  { label: '在庫塗料', value: 0, unit: '本' },
  { label: '製作中プロジェクト', value: 0, unit: '件' },
  { label: '完成済プロジェクト', value: 0, unit: '件' },
  { label: '累計購入額', value: 0, unit: '円' },
] as const

export function DashboardView() {
  // TODO(Phase-B): getMockSession は module-scope 変数の素読み。ログイン状態が
  // 変化しても再レンダーされない。Phase B で useSyncExternalStore または
  // React Context に移行するまでの暫定実装。
  const session = getMockSession()
  const userName = session?.user.name ?? 'ゲスト'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">こんにちは、{userName} さん</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dashboard (統計は Issue #12 で実装予定。現在はスタブ値)
        </p>
      </div>
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {STUB_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1"
          >
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-2xl font-semibold">
              {s.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">{s.unit}</span>
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
