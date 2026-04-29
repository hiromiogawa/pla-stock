import { createFileRoute } from '@tanstack/react-router'
import { getKit, getKitStock, getKitEvents } from '~/entities/kit'
import { getProjects } from '~/entities/project'
import { KitDetailView } from '~/views/KitDetailView'
import { useKitDetail } from '~/views/KitDetailView/useKitDetail'

export const Route = createFileRoute('/_auth/kits/$kitId')({
  loader: async ({ params, context }) => {
    const { userId } = context
    const kitId = params.kitId

    const [kit, stock, events, projects] = await Promise.all([
      getKit({ kitId, userId }),
      getKitStock({ userId, kitId }),
      getKitEvents({ userId, kitId }),
      getProjects({ userId }),
    ])

    if (!kit) {
      return { stock: null, kit: null, events: [], linkedProjects: [], userId }
    }

    // stock が null (未登録) でも kit は返す — 購入ボタンで追加できる
    const linkedProjects = projects.filter((p) => p.kitId === kitId)

    return { stock, kit, events, linkedProjects, userId }
  },
  component: KitDetailRoute,
})

function KitDetailRoute() {
  const { userId, ...data } = Route.useLoaderData()
  const hookProps = useKitDetail({ kit: data.kit, stock: data.stock, userId })
  return <KitDetailView {...data} {...hookProps} />
}
