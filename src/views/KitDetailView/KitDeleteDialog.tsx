import { Button } from '~/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/shared/ui/dialog'

export interface KitDeleteDialogProps {
  open: boolean
  kitName: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

export function KitDeleteDialog({ open, kitName, onOpenChange, onConfirm }: KitDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>キットを削除しますか？</DialogTitle>
          <DialogDescription>
            「{kitName}」の在庫レコードを削除します。マスターデータには影響しませんが、紐付くプロジェクトの kit_stock_id は null になります（プロジェクト自体は残ります）。この操作は元に戻せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              void onConfirm()
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
