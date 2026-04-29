import { createFileRoute } from '@tanstack/react-router'
import { getKits, getKitStocksWithStock } from '~/entities/kit'
import { ProjectCreateView } from '~/views/ProjectCreateView'
import { useProjectCreate } from '~/views/ProjectCreateView/useProjectCreate'

export const Route = createFileRoute('/_auth/projects/new')({
  loader: async ({ context }) => {
    const { userId } = context
    const [kits, stocksWithStock] = await Promise.all([
      getKits({ userId }),
      getKitStocksWithStock({ userId }),
    ])

    // count > 0 の kit_stock に対応する Kit master を抽出
    const kitById = new Map(kits.map((kit) => [kit.id, kit]))
    const selectableKits = stocksWithStock
      .map((stock) => kitById.get(stock.kitId))
      .filter((kit): kit is NonNullable<typeof kit> => kit !== undefined)
    const stockCountByKitId: Record<string, number> = {}
    for (const stock of stocksWithStock) {
      stockCountByKitId[stock.kitId] = stock.count
    }

    return { selectableKits, stockCountByKitId, userId }
  },
  component: ProjectCreateRoute,
})

function ProjectCreateRoute() {
  const { selectableKits, stockCountByKitId, userId } = Route.useLoaderData()
  const hookProps = useProjectCreate({ userId })
  return (
    <ProjectCreateView
      selectableKits={selectableKits}
      stockCountByKitId={stockCountByKitId}
      {...hookProps}
    />
  )
}
