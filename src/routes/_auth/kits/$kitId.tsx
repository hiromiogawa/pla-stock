import { createFileRoute } from '@tanstack/react-router'
import { getKit, getKitStock, getKitEvents } from '~/entities/kit'
import { getProjects } from '~/entities/project'
import { KitDetailView } from '~/views/KitDetailView'
import { useKitDetail } from '~/views/KitDetailView/useKitDetail'

export const Route = createFileRoute('/_auth/kits/$kitId')({
  loader: async ({ params }) => {
    const kitId = params.kitId

    const [kit, stock, events, projects] = await Promise.all([
      getKit({ data: { kitId } }),
      getKitStock({ data: { kitId } }),
      getKitEvents({ data: { kitId } }),
      getProjects(),
    ])

    if (!kit) {
      return { stock: null, kit: null, events: [], linkedProjects: [] }
    }

    const linkedProjects = projects.filter((project) => project.kitId === kitId)

    return { stock, kit, events, linkedProjects }
  },
  component: KitDetailRoute,
})

function KitDetailRoute() {
  const data = Route.useLoaderData()
  const hookProps = useKitDetail({ kit: data.kit, stock: data.stock })
  return <KitDetailView {...data} {...hookProps} />
}
