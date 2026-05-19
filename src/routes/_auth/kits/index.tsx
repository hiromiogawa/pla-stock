import { createFileRoute } from '@tanstack/react-router'
import { getKits, getKitStocksWithStock } from '~/entities/kit'
import { KitListView } from '~/views/KitListView'

export const Route = createFileRoute('/_auth/kits/')({
  loader: async () => {
    const [stocks, kits] = await Promise.all([
      getKitStocksWithStock(), // count > 0 のみ
      getKits(),
    ])
    return { stocks, kits }
  },
  component: KitsIndex,
})

function KitsIndex() {
  const { stocks, kits } = Route.useLoaderData()
  return <KitListView stocks={stocks} kits={kits} />
}
