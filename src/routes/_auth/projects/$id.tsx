import { createFileRoute } from '@tanstack/react-router'
import { getProject, getProjectPaintUses, getProjectPhotos } from '~/shared/api/mock/projects'
import { getKit } from '~/shared/api/mock/kits'
import { getPaints } from '~/shared/api/mock/paints'
import { ProjectDetailView } from '~/views/ProjectDetailView'

export const Route = createFileRoute('/_auth/projects/$id')({
  loader: async ({ params, context }) => {
    const { userId } = context
    const project = await getProject({ projectId: params.id, userId })
    if (!project) {
      return { project: null, kit: null, paintUses: [], paintsForProject: [], allPaints: [], photos: [] }
    }
    const [kit, paintUses, photos, allPaints] = await Promise.all([
      getKit({ kitId: project.kitId, userId }),
      getProjectPaintUses({ projectId: project.id }),
      getProjectPhotos({ projectId: project.id }),
      getPaints({ userId }),
    ])
    // paintUses は paintId のみなので、対応する Paint master を引く
    const paintById = new Map(allPaints.map((p) => [p.id, p]))
    const paintsForProject = paintUses
      .map((link) => paintById.get(link.paintId))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
    return { project, kit, paintUses, paintsForProject, allPaints, photos }
  },
  component: ProjectDetailRoute,
})

function ProjectDetailRoute() {
  const data = Route.useLoaderData()
  return <ProjectDetailView {...data} />
}
