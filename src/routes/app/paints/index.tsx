import { createFileRoute } from '@tanstack/react-router'
import { getPaints, getPaintStocks } from '~/shared/api/mock/paints'
import { getMockSession } from '~/shared/lib/mock-auth'
import { PaintListView } from '~/views/PaintListView'

export const Route = createFileRoute('/app/paints/')({
  loader: async () => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const [stocks, paints] = await Promise.all([
      getPaintStocks({ userId }),
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
