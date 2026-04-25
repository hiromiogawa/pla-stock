/**
 * ユーザードメインモデル。
 *
 * Phase A-1 ではモックのみ。Phase C で Better-Auth + Drizzle の schema と整合させる。
 */
export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  image: string | null
  role: UserRole
}
