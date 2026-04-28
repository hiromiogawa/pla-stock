import { useUser } from '@clerk/tanstack-react-start'

interface DashboardStats {
  kitCount: number
  paintCount: number
  buildingCount: number
  completedCount: number
  purchaseTotalYen: number
}

interface DashboardViewProps {
  stats: DashboardStats
}

const yenFormatter = new Intl.NumberFormat('ja-JP')

export function DashboardView({ stats }: DashboardViewProps) {
  const { user } = useUser()
  const userName = user?.firstName ?? user?.username ?? 'ゲスト'

  const cards = [
    { label: '在庫キット', value: stats.kitCount, unit: '個' },
    { label: '在庫塗料', value: stats.paintCount, unit: '本' },
    { label: '製作中プロジェクト', value: stats.buildingCount, unit: '件' },
    { label: '完成済プロジェクト', value: stats.completedCount, unit: '件' },
    { label: '累計購入額', value: yenFormatter.format(stats.purchaseTotalYen), unit: '円' },
  ] as const

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">こんにちは、{userName} さん</h1>
        <p className="text-sm text-muted-foreground mt-1">
          現在の在庫とプロジェクト状況をまとめて表示します。
        </p>
      </div>
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {cards.map((s) => (
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
