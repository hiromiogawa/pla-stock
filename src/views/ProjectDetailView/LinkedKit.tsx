import { Link } from '@tanstack/react-router'
import type { Kit } from '~/entities/kit'

export function LinkedKit({ kit }: { kit: Kit }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold mb-3">使用キット</h2>
      <Link to="/kits/$kitId" params={{ kitId: kit.id }} className="block hover:underline">
        <div className="text-sm font-medium">{kit.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {kit.grade} · {kit.scale} · {kit.maker}
        </div>
      </Link>
    </section>
  )
}
