import { createFileRoute } from '@tanstack/react-router'
import { getPaint, getPaintStock } from '~/shared/api/mock/paints'
import { getProjects, getProjectPaintStockIds } from '~/shared/api/mock/projects'
import { getMockSession } from '~/shared/lib/mock-auth'
import { PaintDetailView } from '~/views/PaintDetailView'

export const Route = createFileRoute('/app/paints/$stockId')({
  loader: async ({ params }) => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const stock = await getPaintStock({ stockId: params.stockId, userId })
    if (!stock) {
      return { stock: null, paint: null, linkedProjects: [] }
    }
    const paint = await getPaint({ paintId: stock.paintId, userId })
    if (!paint) {
      return { stock: null, paint: null, linkedProjects: [] }
    }
    const projects = await getProjects({ userId })
    // TODO(Phase-C): M:N 逆引き。現在は全プロジェクトを舐めて project_paints を
    // 個別取得する O(N*M) 実装。Phase C では単一 JOIN クエリに置換予定:
    //   SELECT p.* FROM projects p
    //   JOIN project_paints pp ON pp.project_id = p.id
    //   WHERE pp.paint_stock_id = :stockId AND p.user_id = :userId
    const linkedProjects = []
    for (const p of projects) {
      const paintStockIds = await getProjectPaintStockIds({ projectId: p.id })
      if (paintStockIds.includes(stock.id)) {
        linkedProjects.push(p)
      }
    }
    return { stock, paint, linkedProjects }
  },
  component: PaintDetailRoute,
})

function PaintDetailRoute() {
  const data = Route.useLoaderData()
  return <PaintDetailView {...data} />
}
