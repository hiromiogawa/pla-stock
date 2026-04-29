import { createFileRoute } from '@tanstack/react-router'
import { getKits } from '~/entities/kit'
import { getProjects } from '~/entities/project'
import { ProjectListView } from '~/views/ProjectListView'

export const Route = createFileRoute('/_auth/projects/')({
  loader: async ({ context }) => {
    const { userId } = context
    const [projects, kits] = await Promise.all([getProjects({ userId }), getKits({ userId })])

    // project.kitId → kit master を解決し、name と boxArt URL を map 化
    // (boxArt は ProjectList のサムネイルに使う、未紐付き / 画像なし時は null)
    const kitById = new Map(kits.map((kit) => [kit.id, kit]))
    const kitNameByProjectId: Record<string, string | null> = {}
    const kitBoxArtByProjectId: Record<string, string | null> = {}
    for (const project of projects) {
      const kit = kitById.get(project.kitId)
      kitNameByProjectId[project.id] = kit?.name ?? null
      kitBoxArtByProjectId[project.id] = kit?.boxArtUrl ?? null
    }

    return { projects, kitNameByProjectId, kitBoxArtByProjectId }
  },
  component: ProjectsIndex,
})

function ProjectsIndex() {
  const { projects, kitNameByProjectId, kitBoxArtByProjectId } = Route.useLoaderData()
  return (
    <ProjectListView
      projects={projects}
      kitNameByProjectId={kitNameByProjectId}
      kitBoxArtByProjectId={kitBoxArtByProjectId}
    />
  )
}
