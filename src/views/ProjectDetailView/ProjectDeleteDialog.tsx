import type { ProjectStatus } from '~/entities/project'
import { Button } from '~/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/shared/ui/dialog'

export interface ProjectDeleteDialogProps {
  open: boolean
  projectName: string
  projectStatus: ProjectStatus
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

export function ProjectDeleteDialog({
  open,
  projectName,
  projectStatus,
  onOpenChange,
  onConfirm,
}: ProjectDeleteDialogProps) {
  const kitCountNote =
    projectStatus === 'planning'
      ? 'プロジェクトを削除します。kit のカウントは +1 戻ります（在庫に戻る）。'
      : 'プロジェクトを削除します。kit は既に開封済のため在庫に戻りません。'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>「{projectName}」を削除しますか？</DialogTitle>
          <DialogDescription className="space-y-1">
            <span className="block">{kitCountNote}</span>
            <span className="block">project_paint_use と project_photos も連鎖削除されます。</span>
            <span className="block text-destructive font-medium">この操作は元に戻せません。</span>
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
