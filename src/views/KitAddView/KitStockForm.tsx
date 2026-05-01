import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useForm } from '@tanstack/react-form'
import type { Kit } from '~/entities/kit'
import { purchaseEventSchema, type PurchaseEventInput } from '~/features/kit-stock-add'
import { Button } from '~/shared/ui/button'
import { FormTextField } from '~/shared/ui/FormTextField'

interface KitStockFormProps {
  kit: Kit
  onSubmit: (values: PurchaseEventInput) => void | Promise<void>
  onCancel: () => void
}

interface KitStockFormDefaults {
  purchasedAt: string
  purchasePriceYen: string | number | null
  purchaseLocation: string
  note: string
}

const KIT_STOCK_FORM_DEFAULTS: KitStockFormDefaults = {
  purchasedAt: '',
  purchasePriceYen: '',
  purchaseLocation: '',
  note: '',
}

export function KitStockForm({ kit, onSubmit, onCancel }: KitStockFormProps) {
  const form = useForm({
    defaultValues: KIT_STOCK_FORM_DEFAULTS,
    onSubmit: async ({ value }) => {
      const parsed = purchaseEventSchema.parse({
        purchasedAt: value.purchasedAt === '' ? null : value.purchasedAt,
        purchasePriceYen:
          value.purchasePriceYen === '' || value.purchasePriceYen === null
            ? null
            : Number(value.purchasePriceYen),
        purchaseLocation: value.purchaseLocation === '' ? null : value.purchaseLocation,
        note: value.note === '' ? null : value.note,
      })
      await onSubmit(parsed)
    },
  })

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        padding: 2,
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            購入記録を追加
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {kit.name} ({kit.grade} · {kit.scale}) の購入記録を追加して在庫に +1 します。
          </Typography>
        </Stack>

        <form.Field name="purchasedAt">
          {(field) => <FormTextField field={field} label="購入日" type="date" />}
        </form.Field>

        <form.Field name="purchasePriceYen">
          {(field) => (
            <FormTextField field={field} label="購入価格 (円)" type="number" inputMode="numeric" />
          )}
        </form.Field>

        <form.Field name="purchaseLocation">
          {(field) => (
            <FormTextField
              field={field}
              label="購入場所"
              placeholder="ヨドバシ梅田 / Amazon など"
            />
          )}
        </form.Field>

        <form.Field name="note">
          {(field) => <FormTextField field={field} label="メモ" multiline rows={3} />}
        </form.Field>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit">追加</Button>
        </Stack>
      </Stack>
    </Box>
  )
}
