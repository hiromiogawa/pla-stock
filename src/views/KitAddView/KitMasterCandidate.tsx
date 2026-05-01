import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Kit } from '~/entities/kit'
import { Button } from '~/shared/ui/button'

interface KitMasterCandidateProps {
  kit: Kit
  onSelect: () => void
}

export function KitMasterCandidate({ kit, onSelect }: KitMasterCandidateProps) {
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
          {kit.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {kit.grade} · {kit.scale}
        </Typography>
      </Box>
      <Button size="sm" onClick={onSelect} sx={{ flexShrink: 0 }}>
        在庫に追加
      </Button>
    </Stack>
  )
}
