import type { Paint } from '~/entities/paint'
import { Button } from '~/shared/ui/button'
import { PaintSearchPhase } from './PaintSearchPhase'
import { PaintStockForm } from './PaintStockForm'
import type { UsePaintAddReturn } from './usePaintAdd'

interface PaintAddViewProps extends UsePaintAddReturn {
  paints: Paint[]
}

export function PaintAddView({
  paints,
  phase,
  goToSearch,
  selectPaint,
  handleStockSubmit,
}: PaintAddViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">塗料を在庫に追加</h1>
          <p className="text-sm text-muted-foreground mt-1">
            マスターから検索して塗料の購入記録を追加できます。
          </p>
        </div>
        {phase.kind !== 'search' && (
          <Button variant="outline" onClick={goToSearch}>
            検索に戻る
          </Button>
        )}
      </div>

      {phase.kind === 'search' && <PaintSearchPhase paints={paints} onSelectMaster={selectPaint} />}

      {phase.kind === 'add-stock' && (
        <PaintStockForm
          paint={phase.paint}
          onSubmit={(values) => handleStockSubmit(phase.paint.id, values)}
          onCancel={goToSearch}
        />
      )}
    </div>
  )
}
