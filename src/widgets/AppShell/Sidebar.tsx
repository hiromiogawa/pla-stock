import { Link } from '@tanstack/react-router'
import { APP_NAV_ITEMS } from '~/shared/config/nav'
import { cn } from '~/shared/lib/utils'

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:bg-card">
      <div className="px-4 py-5 border-b border-border">
        <span className="text-lg font-semibold tracking-tight">pla-stock</span>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1">
        {APP_NAV_ITEMS.map((item) =>
          item.disabled ? (
            <span
              key={item.key}
              className="block px-3 py-2 text-sm text-muted-foreground/60 cursor-not-allowed"
              title="Phase A-2 以降で実装"
            >
              {item.label}
            </span>
          ) : (
            <Link
              key={item.key}
              to={item.to}
              activeProps={{ className: 'bg-accent text-accent-foreground' }}
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
    </aside>
  )
}
