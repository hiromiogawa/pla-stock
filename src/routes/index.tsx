import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">pla-stock</h1>
      <p className="text-sm text-gray-600">Phase A-1: scaffold cleanup done</p>
    </div>
  )
}
