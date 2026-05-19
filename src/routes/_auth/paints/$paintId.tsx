import { createFileRoute } from '@tanstack/react-router'
import { getPaint, getPaintStock, getPaintEvents } from '~/entities/paint'
import { getProjects, getProjectPaintIds } from '~/entities/project'
import { PaintDetailView } from '~/views/PaintDetailView'
import { usePaintDetail } from '~/views/PaintDetailView/usePaintDetail'

export const Route = createFileRoute('/_auth/paints/$paintId')({
  loader: async ({ params }) => {
    const paintId = params.paintId

    const [paint, stock, events, projects] = await Promise.all([
      getPaint({ data: { paintId } }),
      getPaintStock({ data: { paintId } }),
      getPaintEvents({ data: { paintId } }),
      getProjects(),
    ])

    if (!paint) {
      return { stock: null, paint: null, events: [], linkedProjects: [] }
    }

    // project_paint_use で paintId が使われているプロジェクトを逆引き
    const projectPaintIdsList = await Promise.all(
      projects.map((project) => getProjectPaintIds({ data: { projectId: project.id } })),
    )
    const linkedProjects = projects.filter((_, idx) => projectPaintIdsList[idx].includes(paintId))

    return { stock, paint, events, linkedProjects }
  },
  component: PaintDetailRoute,
})

function PaintDetailRoute() {
  const data = Route.useLoaderData()
  const hookProps = usePaintDetail({ paint: data.paint, stock: data.stock })
  return <PaintDetailView {...data} {...hookProps} />
}
