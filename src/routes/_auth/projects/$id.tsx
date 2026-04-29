import { createFileRoute } from '@tanstack/react-router'
import { getProject, getProjectPaintUses, getProjectPhotos } from '~/entities/project'
import { getKit } from '~/entities/kit'
import { getPaints } from '~/entities/paint'
import { ProjectDetailView } from '~/views/ProjectDetailView'
import { useProjectDetail } from '~/views/ProjectDetailView/useProjectDetail'

export const Route = createFileRoute('/_auth/projects/$id')({
  loader: async ({ params, context }) => {
    const { userId } = context
    const project = await getProject({ projectId: params.id, userId })
    if (!project) {
      return {
        project: null,
        kit: null,
        paintsForProject: [],
        allPaints: [],
        photos: [],
        userId,
      }
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
    return { project, kit, paintsForProject, allPaints, photos, userId }
  },
  component: ProjectDetailRoute,
})

function ProjectDetailRoute() {
  const { userId, ...data } = Route.useLoaderData()
  const hookProps = useProjectDetail({ project: data.project, userId })
  return <ProjectDetailView {...data} {...hookProps} />
}
