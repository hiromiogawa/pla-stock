import type { Kit } from '~/entities/kit'
import { Button } from '~/shared/ui/button'
import { KitSearchPhase } from './KitSearchPhase'
import { KitStockForm } from './KitStockForm'
import type { UseKitAddReturn } from './useKitAdd'

interface KitAddViewProps extends UseKitAddReturn {
  kits: Kit[]
}

export function KitAddView({
  kits,
  phase,
  goToSearch,
  selectKit,
  handleStockSubmit,
}: KitAddViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">キットを在庫に追加</h1>
          <p className="text-sm text-muted-foreground mt-1">
            マスターから検索してキットの購入記録を追加できます。
          </p>
        </div>
        {phase.kind !== 'search' && (
          <Button variant="outline" onClick={goToSearch}>
            検索に戻る
          </Button>
        )}
      </div>

      {phase.kind === 'search' && <KitSearchPhase kits={kits} onSelectMaster={selectKit} />}

      {phase.kind === 'add-stock' && (
        <KitStockForm
          kit={phase.kit}
          onSubmit={(values) => handleStockSubmit(phase.kit.id, values)}
          onCancel={goToSearch}
        />
      )}
    </div>
  )
}
