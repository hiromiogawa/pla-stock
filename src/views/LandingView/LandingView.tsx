import { SignInButton, SignUpButton } from '@clerk/tanstack-react-start'
import { Button } from '~/shared/ui/button'

export function LandingView() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">pla-stock</span>
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
              モデラー向けツール。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignInButton mode="modal">
              <Button>ログイン</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline">サインアップ</Button>
            </SignUpButton>
          </div>
        </div>
      </main>
      <footer className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} pla-stock
        </div>
      </footer>
    </div>
  )
}
