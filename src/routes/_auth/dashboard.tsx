import { createFileRoute } from '@tanstack/react-router'
import { getKitStocksWithStock, getKitEventsAll } from '~/entities/kit'
import { getPaintStocksWithStock, getPaintEventsAll } from '~/entities/paint'
import { getProjects } from '~/entities/project'
import { DashboardView } from '~/views/DashboardView'

export const Route = createFileRoute('/_auth/dashboard')({
  loader: async ({ context }) => {
    const { userId } = context
    const [kitStocks, paintStocks, projects, kitEvents, paintEvents] = await Promise.all([
      getKitStocksWithStock({ userId }),
      getPaintStocksWithStock({ userId }),
      getProjects({ userId }),
      getKitEventsAll({ userId }),
      getPaintEventsAll({ userId }),
    ])

    const kitCount = kitStocks.reduce((s, ks) => s + ks.count, 0)
    const paintCount = paintStocks.reduce((s, ps) => s + ps.count, 0)
    const buildingCount = projects.filter((p) => p.status === 'building').length
    const completedCount = projects.filter((p) => p.status === 'completed').length
    const purchaseTotalYen =
      kitEvents.filter((e) => e.reason === 'purchase').reduce((s, e) => s + (e.priceYen ?? 0), 0) +
      paintEvents.filter((e) => e.reason === 'purchase').reduce((s, e) => s + (e.priceYen ?? 0), 0)

    return {
      stats: {
        kitCount,
        paintCount,
        buildingCount,
        completedCount,
        purchaseTotalYen,
      },
    }
  },
  component: DashboardRoute,
})

function DashboardRoute() {
  const { stats } = Route.useLoaderData()
  return <DashboardView stats={stats} />
}
