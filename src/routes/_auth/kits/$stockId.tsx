import { createFileRoute } from '@tanstack/react-router'
import { getKit, getKitStock } from '~/shared/api/mock/kits'
import { getProjects } from '~/shared/api/mock/projects'
import { getMockSession } from '~/shared/lib/mock-auth'
import { KitDetailView } from '~/views/KitDetailView'

export const Route = createFileRoute('/app/kits/$stockId')({
  loader: async ({ params }) => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const stock = await getKitStock({ stockId: params.stockId, userId })
    if (!stock) {
      return { stock: null, kit: null, linkedProjects: [] }
    }
    const kit = await getKit({ kitId: stock.kitId, userId })
    if (!kit) {
      return { stock: null, kit: null, linkedProjects: [] }
    }
    const projects = await getProjects({ userId })
    const linkedProjects = projects.filter((p) => p.kitStockId === stock.id)
    return { stock, kit, linkedProjects }
  },
  component: KitDetailRoute,
})

function KitDetailRoute() {
  const data = Route.useLoaderData()
  return <KitDetailView {...data} />
}
