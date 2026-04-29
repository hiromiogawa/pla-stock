import { createFileRoute } from '@tanstack/react-router'
import { getKits } from '~/entities/kit'
import { getProjects } from '~/entities/project'
import { ProjectListView } from '~/views/ProjectListView'

export const Route = createFileRoute('/_auth/projects/')({
  loader: async ({ context }) => {
    const { userId } = context
    const [projects, kits] = await Promise.all([getProjects({ userId }), getKits({ userId })])

    // project.kitId → kit master → kit.name の map を構築 (kit_stocks 経由不要)
    const kitById = new Map(kits.map((kit) => [kit.id, kit]))
    const kitNameByProjectId: Record<string, string | null> = {}
    for (const project of projects) {
      const kit = kitById.get(project.kitId)
      kitNameByProjectId[project.id] = kit?.name ?? null
    }

    return { projects, kitNameByProjectId }
  },
  component: ProjectsIndex,
})

function ProjectsIndex() {
  const { projects, kitNameByProjectId } = Route.useLoaderData()
  return <ProjectListView projects={projects} kitNameByProjectId={kitNameByProjectId} />
}
