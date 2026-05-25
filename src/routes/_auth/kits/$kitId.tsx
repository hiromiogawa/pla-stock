import { createFileRoute } from '@tanstack/react-router'
import { getKit, getKitEvents, getKitStock } from '~/entities/kit'
import { getProjects } from '~/entities/project'
import { KitDetailView } from '~/views/KitDetailView'
import { useKitDetail } from '~/views/KitDetailView/useKitDetail'

/**
 * KitDetail loader の部分失敗エラー (#167)。
 *
 * key の存在 = その query が rejected、value = user 向けエラーメッセージ。
 * key の不在 = その query は成功 (fulfilled)。
 *
 * 設計判断: kit は必須 (失敗時は loader 自体が throw して 404 fallback)。
 * stock / events / linkedProjects は **任意**、失敗時は空相当の値で fallback +
 * View 側で warning notification を表示。
 *
 * NOTE: 同型は View 側 (`KitDetailView.tsx`) に `PartialLoadErrors` として別途
 * 定義済 (FSD: routes/ → views/ は単方向違反のため import 不可)。
 */
type KitDetailLoadErrors = {
  stock?: string
  events?: string
  projects?: string
}

function formatError(reason: unknown): string {
  if (reason instanceof Error) return reason.message
  return String(reason)
}

export const Route = createFileRoute('/_auth/kits/$kitId')({
  loader: async ({ params }) => {
    const kitId = params.kitId

    // kit は必須 — 取得失敗時は throw され loader 全体が reject (TanStack Router の
    // errorComponent / nearest error boundary で扱う)。本 loader 内では catch しない。
    const kit = await getKit({ data: { kitId } })
    if (!kit) {
      const emptyErrors: KitDetailLoadErrors = {}
      return {
        stock: null,
        kit: null,
        events: [],
        linkedProjects: [],
        errors: emptyErrors,
      }
    }

    // 任意 query は Promise.allSettled で部分失敗を許容 (#167)。
    // 1 つ失敗しても他は表示できる UX に。
    const [stockResult, eventsResult, projectsResult] = await Promise.allSettled([
      getKitStock({ data: { kitId } }),
      getKitEvents({ data: { kitId } }),
      getProjects(),
    ])

    const errors: KitDetailLoadErrors = {}

    const stock = stockResult.status === 'fulfilled' ? stockResult.value : null
    if (stockResult.status === 'rejected') errors.stock = formatError(stockResult.reason)

    const events = eventsResult.status === 'fulfilled' ? eventsResult.value : []
    if (eventsResult.status === 'rejected') errors.events = formatError(eventsResult.reason)

    const linkedProjects =
      projectsResult.status === 'fulfilled'
        ? projectsResult.value.filter((project) => project.kitId === kitId)
        : []
    if (projectsResult.status === 'rejected') errors.projects = formatError(projectsResult.reason)

    return { stock, kit, events, linkedProjects, errors }
  },
  component: KitDetailRoute,
})

function KitDetailRoute() {
  const data = Route.useLoaderData()
  const hookProps = useKitDetail({ kit: data.kit, stock: data.stock })
  return <KitDetailView {...data} {...hookProps} />
}
