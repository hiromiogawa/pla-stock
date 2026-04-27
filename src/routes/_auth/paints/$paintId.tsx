import { createFileRoute } from '@tanstack/react-router'
import { getPaint, getPaintStock, getPaintEvents } from '~/shared/api/mock/paints'
import { getProjects, getProjectPaintIds } from '~/shared/api/mock/projects'
import { getMockSession } from '~/shared/lib/mock-auth'
import { PaintDetailView } from '~/views/PaintDetailView'

export const Route = createFileRoute('/_auth/paints/$paintId')({
  loader: async ({ params }) => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const paintId = params.paintId

    const [paint, stock, events, projects] = await Promise.all([
      getPaint({ paintId, userId }),
      getPaintStock({ userId, paintId }),
      getPaintEvents({ userId, paintId }),
      getProjects({ userId }),
    ])

    if (!paint) {
      return { stock: null, paint: null, events: [], linkedProjects: [] }
    }

    // project_paint_use で paintId が使われているプロジェクトを逆引き
    const linkedProjects = []
    for (const p of projects) {
      const paintIds = await getProjectPaintIds({ projectId: p.id })
      if (paintIds.includes(paintId)) {
        linkedProjects.push(p)
      }
    }

    return { stock, paint, events, linkedProjects }
  },
  component: PaintDetailRoute,
})

function PaintDetailRoute() {
  const data = Route.useLoaderData()
  return <PaintDetailView {...data} />
}
