import { createFileRoute } from '@tanstack/react-router'
import { getPaints, getPaintStocksWithStock } from '~/entities/paint'
import { PaintListView } from '~/views/PaintListView'

export const Route = createFileRoute('/_auth/paints/')({
  loader: async () => {
    const [stocks, paints] = await Promise.all([
      getPaintStocksWithStock(), // count > 0 のみ
      getPaints(),
    ])
    return { stocks, paints }
  },
  component: PaintsIndex,
})

function PaintsIndex() {
  const { stocks, paints } = Route.useLoaderData()
  return <PaintListView stocks={stocks} paints={paints} />
}
