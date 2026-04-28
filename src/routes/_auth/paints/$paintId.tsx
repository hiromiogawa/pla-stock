import { createFileRoute } from '@tanstack/react-router'
import { getPaint, getPaintStock, getPaintEvents } from '~/entities/paint'
import { getProjects, getProjectPaintIds } from '~/entities/project'
import { PaintDetailView } from '~/views/PaintDetailView'
import { usePaintDetail } from '~/views/PaintDetailView/usePaintDetail'

export const Route = createFileRoute('/_auth/paints/$paintId')({
  loader: async ({ params, context }) => {
    const { userId } = context
    const paintId = params.paintId

    const [paint, stock, events, projects] = await Promise.all([
      getPaint({ paintId, userId }),
      getPaintStock({ userId, paintId }),
      getPaintEvents({ userId, paintId }),
      getProjects({ userId }),
    ])

    if (!paint) {
      return { stock: null, paint: null, events: [], linkedProjects: [], userId }
    }

    // project_paint_use で paintId が使われているプロジェクトを逆引き
    const projectPaintIdsList = await Promise.all(
      projects.map((p) => getProjectPaintIds({ projectId: p.id })),
    )
    const linkedProjects = projects.filter((_, i) => projectPaintIdsList[i].includes(paintId))

    return { stock, paint, events, linkedProjects, userId }
  },
  component: PaintDetailRoute,
})

function PaintDetailRoute() {
  const { userId, ...data } = Route.useLoaderData()
  const hookProps = usePaintDetail({ paint: data.paint, stock: data.stock, userId })
  return <PaintDetailView {...data} {...hookProps} />
}
