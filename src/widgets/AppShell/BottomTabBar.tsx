import { Link } from '@tanstack/react-router'
import { APP_NAV_ITEMS } from '~/shared/config/nav'
import { cn } from '~/shared/lib/utils'

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 md:hidden border-t border-border bg-card">
      <ul className="flex">
        {APP_NAV_ITEMS.map((item) => (
          <li key={item.key} className="flex-1">
            {item.disabled ? (
              <span
                role="link"
                aria-disabled="true"
                className="flex flex-col items-center justify-center py-2 text-xs text-muted-foreground/60"
                title="Phase A-2 以降で実装"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                activeProps={{ className: 'text-foreground' }}
                className={cn(
                  'flex flex-col items-center justify-center py-2 text-xs text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
