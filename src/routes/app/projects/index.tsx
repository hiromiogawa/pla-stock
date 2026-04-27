import { createFileRoute } from '@tanstack/react-router'
import { getKits, getKitStocks } from '~/shared/api/mock/kits'
import { getProjects } from '~/shared/api/mock/projects'
import { getMockSession } from '~/shared/lib/mock-auth'
import { ProjectListView } from '~/views/ProjectListView'

export const Route = createFileRoute('/app/projects/')({
  loader: async () => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const [projects, kitStocks, kits] = await Promise.all([
      getProjects({ userId }),
      getKitStocks({ userId }),
      getKits({ userId }),
    ])

    // project.kitStockId → kit_stock → kit.name の map を構築
    const kitById = new Map(kits.map((k) => [k.id, k]))
    const kitStockById = new Map(kitStocks.map((s) => [s.id, s]))
    const kitNameByProjectId: Record<string, string | null> = {}
    for (const p of projects) {
      if (p.kitStockId == null) {
        kitNameByProjectId[p.id] = null
        continue
      }
      const stock = kitStockById.get(p.kitStockId)
      if (!stock) {
        kitNameByProjectId[p.id] = null
        continue
      }
      const kit = kitById.get(stock.kitId)
      kitNameByProjectId[p.id] = kit?.name ?? null
    }

    return { projects, kitNameByProjectId }
  },
  component: ProjectsIndex,
})

function ProjectsIndex() {
  const { projects, kitNameByProjectId } = Route.useLoaderData()
  return (
    <ProjectListView
      projects={projects}
      kitNameByProjectId={kitNameByProjectId}
    />
  )
}
