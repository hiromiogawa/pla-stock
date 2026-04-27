import { createFileRoute } from '@tanstack/react-router'
import { getPaint, getPaintStock } from '~/shared/api/mock/paints'
import { getProjects, getProjectPaintStockIds } from '~/shared/api/mock/projects'
import { getMockSession } from '~/shared/lib/mock-auth'
import { PaintDetailView } from '~/views/PaintDetailView'

export const Route = createFileRoute('/app/paints/$stockId')({
  loader: async ({ params }) => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const stock = await getPaintStock({ stockId: params.stockId, userId })
    if (!stock) {
      return { stock: null, paint: null, linkedProjects: [] }
    }
    const paint = await getPaint({ paintId: stock.paintId, userId })
    if (!paint) {
      return { stock: null, paint: null, linkedProjects: [] }
    }
    const projects = await getProjects({ userId })
    const linkedProjects = []
    for (const p of projects) {
      const paintStockIds = await getProjectPaintStockIds({ projectId: p.id })
      if (paintStockIds.includes(stock.id)) {
        linkedProjects.push(p)
      }
    }
    return { stock, paint, linkedProjects }
  },
  component: PaintDetailRoute,
})

function PaintDetailRoute() {
  const data = Route.useLoaderData()
  return <PaintDetailView {...data} />
}
