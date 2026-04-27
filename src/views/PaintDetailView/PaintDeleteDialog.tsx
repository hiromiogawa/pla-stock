import { Button } from '~/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/shared/ui/dialog'

export interface PaintDeleteDialogProps {
  open: boolean
  paintLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

export function PaintDeleteDialog({
  open,
  paintLabel,
  onOpenChange,
  onConfirm,
}: PaintDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>塗料を削除しますか？</DialogTitle>
          <DialogDescription>
            「{paintLabel}」の在庫レコードを削除します。マスターデータには影響しません。プロジェクトに紐付いていた場合、project_paints の link は残ります（孤立 link になります — Phase C で FK 制約整備時に整理予定）。この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onConfirm()
              onOpenChange(false)
            }}
          >
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
