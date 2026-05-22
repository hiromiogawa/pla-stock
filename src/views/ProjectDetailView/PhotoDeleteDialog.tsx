import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { Button } from '~/shared/ui/button'

interface PhotoDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

/**
 * 写真削除の確認ダイアログ（ProjectDeleteDialog と同一構成の写真版）。
 * 「削除」確定で onConfirm、確定後はダイアログを閉じる。
 */
export function PhotoDeleteDialog({ open, onOpenChange, onConfirm }: PhotoDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} fullWidth maxWidth="sm">
      <DialogTitle>写真を削除しますか？</DialogTitle>
      <DialogContent>
        <DialogContentText>この操作は元に戻せません。</DialogContentText>
      </DialogContent>
      <DialogActions>
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
      </DialogActions>
    </Dialog>
  )
}
