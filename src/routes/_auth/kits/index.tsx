import { createFileRoute } from '@tanstack/react-router'
import { getKits, getKitStocksWithStock } from '~/shared/api/mock/kits'
import { getMockSession } from '~/shared/lib/mock-auth'
import { KitListView } from '~/views/KitListView'

export const Route = createFileRoute('/_auth/kits/')({
  loader: async () => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const [stocks, kits] = await Promise.all([
      getKitStocksWithStock({ userId }), // count > 0 のみ
      getKits({ userId }),
    ])
    return { stocks, kits }
  },
  component: KitsIndex,
})

function KitsIndex() {
  const { stocks, kits } = Route.useLoaderData()
  return <KitListView stocks={stocks} kits={kits} />
}
