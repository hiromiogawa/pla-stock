import { createFileRoute } from '@tanstack/react-router'
import { getProject, getProjectPaintUses, getProjectPhotos } from '~/entities/project'
import { getKit } from '~/entities/kit'
import { getPaints } from '~/entities/paint'
import { ProjectDetailView } from '~/views/ProjectDetailView'
import { useProjectDetail } from '~/views/ProjectDetailView/useProjectDetail'

export const Route = createFileRoute('/_auth/projects/$id')({
  loader: async ({ params }) => {
    const project = await getProject({ data: { projectId: params.id } })
    if (!project) {
      return {
        project: null,
        kit: null,
        paintsForProject: [],
        allPaints: [],
        photos: [],
      }
    }
    const [kit, paintUses, photos, allPaints] = await Promise.all([
      getKit({ data: { kitId: project.kitId } }),
      getProjectPaintUses({ data: { projectId: project.id } }),
      getProjectPhotos({ data: { projectId: project.id } }),
      getPaints(),
    ])
    // paintUses は paintId のみなので、対応する Paint master を引く
    const paintById = new Map(allPaints.map((paint) => [paint.id, paint]))
    const paintsForProject = paintUses
      .map((link) => paintById.get(link.paintId))
      .filter((paint): paint is NonNullable<typeof paint> => paint !== undefined)
    return { project, kit, paintsForProject, allPaints, photos }
  },
  component: ProjectDetailRoute,
})

function ProjectDetailRoute() {
  const data = Route.useLoaderData()
  const hookProps = useProjectDetail({ project: data.project })
  return <ProjectDetailView {...data} {...hookProps} />
}
