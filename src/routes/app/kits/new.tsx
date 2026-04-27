import { createFileRoute } from '@tanstack/react-router'
import { getKits } from '~/shared/api/mock/kits'
import { getMockSession } from '~/shared/lib/mock-auth'
import { KitAddView } from '~/views/KitAddView'

export const Route = createFileRoute('/app/kits/new')({
  loader: async () => {
    const session = getMockSession()
    const userId = session?.user.id ?? 'mock-user-1'
    const kits = await getKits({ userId })
    return { kits, userId }
  },
  component: KitAddRoute,
})

function KitAddRoute() {
  const { kits, userId } = Route.useLoaderData()
  return <KitAddView kits={kits} userId={userId} />
}
