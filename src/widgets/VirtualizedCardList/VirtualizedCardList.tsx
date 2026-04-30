import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useVirtualizer } from '@tanstack/react-virtual'
import { type ReactNode, useRef } from 'react'

interface VirtualizedCardListProps<TRow> {
  rows: TRow[]
  rowKey: (row: TRow) => string
  /** Render the card content. Should include its own Link wrapper for navigation. */
  renderRow: (row: TRow) => ReactNode
  /** Default 84px. */
  estimateRowSize?: number
  emptyMessage: string
}

/**
 * Refined Minimalism craft の virtualized card list (SP 用)。
 * 担当: scroll container / virtualization positioning / empty state / card 間の gap (pb: 1).
 * 非担当: card content (Link wrapper 含む) は consumer が renderRow で返す。
 */
export function VirtualizedCardList<TRow>({
  rows,
  rowKey,
  renderRow,
  estimateRowSize = 84,
  emptyMessage,
}: VirtualizedCardListProps<TRow>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateRowSize,
    overscan: 6,
  })

  if (rows.length === 0) {
    return (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textAlign: 'center',
          py: 6,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        {emptyMessage}
      </Typography>
    )
  }

  return (
    <Box ref={containerRef} sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <Box sx={{ position: 'relative', height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const row = rows[virtualItem.index]
          if (!row) return null
          return (
            <Box
              key={rowKey(row)}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
                pb: 1,
              }}
            >
              {renderRow(row)}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
