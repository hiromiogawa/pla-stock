import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Minus, Plus } from 'lucide-react'
import type { Kit, KitEvent, KitStock } from '~/entities/kit'

interface FieldRowProps {
  label: string
  value: string | number | null | undefined
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: 2,
        py: 1.25,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ margin: 0 }}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

const REASON_LABEL: Record<KitEvent['reason'], string> = {
  purchase: '購入',
  project: 'プロジェクト',
  gift: '贈り物',
  sell: '売却',
  discard: '廃棄',
  other: 'その他',
}

interface SectionProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

function Section({ title, children, action }: SectionProps) {
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
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Box>
  )
}

interface KitDetailFieldsProps {
  stock: KitStock
  kit: Kit
  events: KitEvent[]
  onPurchase: () => void
  onRelease: () => void
}

export function KitDetailFields({
  stock,
  kit,
  events,
  onPurchase,
  onRelease,
}: KitDetailFieldsProps) {
  return (
    <Stack spacing={2.5}>
      {/* キット情報 (master) */}
      <Section title="キット情報">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'flex-start' }}
        >
          {kit.boxArtUrl && (
            <Box
              component="img"
              src={kit.boxArtUrl}
              alt={kit.name}
              sx={{
                width: { xs: '100%', md: 200 },
                flexShrink: 0,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            />
          )}
          <Box component="dl" sx={{ flex: 1, margin: 0 }}>
            <FieldRow label="名前" value={kit.name} />
            <FieldRow label="グレード" value={kit.grade} />
            <FieldRow label="スケール" value={kit.scale} />
            <FieldRow
              label="定価"
              value={kit.retailPriceYen != null ? `¥${kit.retailPriceYen.toLocaleString()}` : null}
            />
          </Box>
        </Stack>
      </Section>

      {/* 在庫情報 + Primary action (+/-) */}
      <Section
        title="在庫"
        action={
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton
              size="small"
              aria-label="出庫 (-1)"
              onClick={onRelease}
              disabled={stock.count === 0}
              sx={{ color: 'text.secondary' }}
            >
              <Minus size={16} strokeWidth={1.75} />
            </IconButton>
            <IconButton
              size="small"
              aria-label="購入 (+1)"
              onClick={onPurchase}
              sx={{ color: 'text.secondary' }}
            >
              <Plus size={16} strokeWidth={1.75} />
            </IconButton>
          </Stack>
        }
      >
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {stock.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            個
          </Typography>
        </Stack>
      </Section>

      {/* 入出庫履歴 */}
      {events.length > 0 && (
        <Section title="入出庫履歴">
          <Stack component="ul" spacing={1.25} sx={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {events.map((event) => (
              <Stack
                key={event.id}
                component="li"
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
              >
                <Typography
                  variant="body2"
                  sx={{
                    flexShrink: 0,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    color: event.delta > 0 ? 'success.main' : 'error.main',
                    minWidth: 32,
                  }}
                >
                  {event.delta > 0 ? `+${event.delta}` : event.delta}
                </Typography>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {REASON_LABEL[event.reason]}
                  </Typography>
                  {event.priceYen != null && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                      sx={{ ml: 1.5 }}
                    >
                      ¥{event.priceYen.toLocaleString()}
                    </Typography>
                  )}
                  {event.purchaseLocation && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                      sx={{ ml: 1.5 }}
                    >
                      @ {event.purchaseLocation}
                    </Typography>
                  )}
                  {event.note && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.25 }}
                    >
                      {event.note}
                    </Typography>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                >
                  {event.purchasedAt ?? event.createdAt.slice(0, 10)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Section>
      )}
    </Stack>
  )
}
