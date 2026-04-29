import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { ProjectPhoto } from '~/entities/project'
import { AddPhotoDialog, type AddPhotoInput } from './AddPhotoDialog'

interface ProjectPhotosProps {
  photos: ProjectPhoto[]
  onAdd: (input: AddPhotoInput) => void | Promise<void>
  onRemove: (photoId: string) => void | Promise<void>
}

export function ProjectPhotos({ photos, onAdd, onRemove }: ProjectPhotosProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          写真
        </Typography>
        <IconButton
          size="small"
          aria-label="写真を追加"
          onClick={() => setShowAddDialog(true)}
          sx={{ color: 'text.secondary' }}
        >
          <Plus size={16} strokeWidth={1.75} />
        </IconButton>
      </Stack>
      {photos.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          まだ写真がありません
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 1.5,
          }}
        >
          {photos.map((photo) => (
            <Box
              key={photo.id}
              sx={{ position: 'relative', '&:hover .remove-overlay': { opacity: 1 } }}
            >
              <Box
                component="img"
                src={photo.url}
                alt={photo.caption ?? ''}
                sx={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  display: 'block',
                }}
              />
              {photo.caption && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {photo.caption}
                </Typography>
              )}
              <IconButton
                className="remove-overlay"
                size="small"
                aria-label="写真を削除"
                onClick={() => void onRemove(photo.id)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'background.paper',
                  color: 'error.main',
                  opacity: 0,
                  transition: 'opacity 120ms ease',
                  '&:hover': { bgcolor: 'background.paper' },
                }}
              >
                <X size={14} strokeWidth={1.75} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      <AddPhotoDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await onAdd(input)
          setShowAddDialog(false)
        }}
      />
    </Box>
  )
}
