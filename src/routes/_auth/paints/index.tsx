import { createFileRoute } from '@tanstack/react-router'
import { getPaints, getPaintStocksWithStock } from '~/shared/api/mock/paints'
import { PaintListView } from '~/views/PaintListView'

export const Route = createFileRoute('/_auth/paints/')({
  loader: async ({ context }) => {
    const { userId } = context
    const [stocks, paints] = await Promise.all([
      getPaintStocksWithStock({ userId }), // count > 0 のみ
      getPaints({ userId }),
    ])
    return { stocks, paints }
  },
  component: PaintsIndex,
})

function PaintsIndex() {
  const { stocks, paints } = Route.useLoaderData()
  return <PaintListView stocks={stocks} paints={paints} />
}
