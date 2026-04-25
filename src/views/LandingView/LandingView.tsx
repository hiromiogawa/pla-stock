import { useNavigate } from '@tanstack/react-router'
import { Button } from '~/shared/ui/button'
import { mockLogin } from '~/shared/lib/mock-auth'

export function LandingView() {
  const navigate = useNavigate()

  const handleMockLogin = (role: 'user' | 'admin') => {
    mockLogin(role)
    // @ts-expect-error – /app route is registered in Task 8
    void navigate({ to: '/app' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">pla-stock</span>
          <span className="text-xs text-muted-foreground">Phase A-1 (mock)</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              プラモデル・塗料の在庫管理
            </h1>
            <p className="text-muted-foreground">
              持っているキット・塗料を登録し、製作プロジェクトごとに紐付ける
              モデラー向けツール。ホビーショップ店頭での「これ持ってた？」を
              バーコードスキャンで一瞬で判別。
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Phase A-1: 本物の Google ログインは Phase C で実装予定。
              今はモックログインで UI を確認できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => handleMockLogin('user')}>
                モックログイン (一般ユーザー)
              </Button>
              <Button variant="outline" onClick={() => handleMockLogin('admin')}>
                モックログイン (管理者)
              </Button>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 text-xs text-muted-foreground">
          © 2026 pla-stock
        </div>
      </footer>
    </div>
  )
}
