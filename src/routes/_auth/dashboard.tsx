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

    const kitCount = kitStocks.reduce((sum, stock) => sum + stock.count, 0)
    const paintCount = paintStocks.reduce((sum, stock) => sum + stock.count, 0)
    const buildingCount = projects.filter((project) => project.status === 'building').length
    const completedCount = projects.filter((project) => project.status === 'completed').length
    const purchaseTotalYen =
      kitEvents
        .filter((event) => event.reason === 'purchase')
        .reduce((sum, event) => sum + (event.priceYen ?? 0), 0) +
      paintEvents
        .filter((event) => event.reason === 'purchase')
        .reduce((sum, event) => sum + (event.priceYen ?? 0), 0)

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
