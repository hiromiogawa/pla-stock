import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { Paint } from '~/entities/paint'
import { Badge } from '~/shared/ui/badge'
import { AddPaintDialog } from './AddPaintDialog'

interface ProjectPaintUsesProps {
  paints: Paint[]
  allPaints: Paint[]
  onAdd: (paintId: string) => void | Promise<void>
  onRemove: (paintId: string) => void | Promise<void>
}

export function ProjectPaintUses({ paints, allPaints, onAdd, onRemove }: ProjectPaintUsesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  // すでに紐付いてる paintId を除いた候補
  const candidates = allPaints.filter((paint) => !paints.some((current) => current.id === paint.id))

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
          使用塗料
        </Typography>
        <IconButton
          size="small"
          aria-label="塗料を追加"
          onClick={() => setShowAddDialog(true)}
          sx={{ color: 'text.secondary' }}
        >
          <Plus size={16} strokeWidth={1.75} />
        </IconButton>
      </Stack>
      {paints.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          まだ塗料が追加されていません
        </Typography>
      ) : (
        <Box
          component="ul"
          sx={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 1,
            // 塗料数が増えた時 (20+) でも他 section を圧迫しないよう max-height + scroll
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {paints.map((paint) => (
            <Stack
              key={paint.id}
              component="li"
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                padding: 1.5,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Link
                  to="/paints/$paintId"
                  params={{ paintId: paint.id }}
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'inherit',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {paint.brand} {paint.code} {paint.name}
                </Link>
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
              <IconButton
                size="small"
                aria-label={`${paint.name} を外す`}
                onClick={() => void onRemove(paint.id)}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              >
                <X size={16} strokeWidth={1.75} />
              </IconButton>
            </Stack>
          ))}
        </Box>
      )}
      <AddPaintDialog
        open={showAddDialog}
        candidates={candidates}
        onOpenChange={setShowAddDialog}
        onSelect={async (paintId) => {
          await onAdd(paintId)
          setShowAddDialog(false)
        }}
      />
    </Box>
  )
}
