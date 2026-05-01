import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Paint } from '~/entities/paint'
import { Badge } from '~/shared/ui/badge'
import { Button } from '~/shared/ui/button'

interface PaintMasterCandidateProps {
  paint: Paint
  onSelect: () => void
}

export function PaintMasterCandidate({ paint, onSelect }: PaintMasterCandidateProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        padding: 1.5,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {paint.brand} {paint.code} {paint.name}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }}>
          {paint.colorFamily && (
            <Badge variant="outline" className="text-xs">
              {paint.colorFamily}
            </Badge>
          )}
          {paint.finishType && (
            <Badge variant="outline" className="text-xs">
              {paint.finishType}
            </Badge>
          )}
        </Stack>
      </Box>
      <Button size="sm" onClick={onSelect} sx={{ flexShrink: 0 }}>
        在庫に追加
      </Button>
    </Stack>
  )
}
