import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import type { Kit } from '~/entities/kit'

interface LinkedKitProps {
  kit: Kit
}

export function LinkedKit({ kit }: LinkedKitProps) {
  return (
    <Box
      component="section"
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        padding: 2,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.25 }}>
        使用キット
      </Typography>
      <Link
        to="/kits/$kitId"
        params={{ kitId: kit.id }}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            padding: 1,
            margin: -1,
            borderRadius: 1,
            transition: 'background-color 120ms ease',
            '&:hover': { backgroundColor: 'action.hover' },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              color: 'text.secondary',
              bgcolor: 'action.hover',
            }}
          >
            {kit.boxArtUrl ? (
              <Box
                component="img"
                src={kit.boxArtUrl}
                alt={kit.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              'No Image'
            )}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {kit.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {kit.grade} · {kit.scale}
            </Typography>
          </Box>
        </Stack>
      </Link>
    </Box>
  )
}
