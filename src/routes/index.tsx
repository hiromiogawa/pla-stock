import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/shared/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">pla-stock</h1>
      <p className="text-sm text-muted-foreground">Phase A-1: shadcn/ui + Tailwind theme 確認</p>
      <div className="flex gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </div>
  )
}
