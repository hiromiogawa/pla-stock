import { getMockSession } from '~/shared/lib/mock-auth'

const STUB_STATS = [
  { label: '未組立', value: 0, unit: '個' },
  { label: '組立中', value: 0, unit: '個' },
  { label: '完成', value: 0, unit: '個' },
  { label: 'アクティブプロジェクト', value: 0, unit: '件' },
  { label: '使用中塗料', value: 0, unit: '本' },
] as const

/**
 * Phase A-1 の Dashboard。
 * 統計は全部スタブ (0 固定)。A-2 以降で mock データ経由で実数が入る。
 */
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
          Phase A-1 Dashboard (統計はすべてスタブ、Phase A-2 以降で実データが入ります)
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
