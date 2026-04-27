import { createStart } from '@tanstack/react-start'
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'

/**
 * TanStack Start の起動オプション。
 * clerkMiddleware を requestMiddleware に登録し、全リクエストに Clerk の認証コンテキストを付与する。
 */
export const startInstance = createStart(() => ({
  requestMiddleware: [clerkMiddleware()],
}))
