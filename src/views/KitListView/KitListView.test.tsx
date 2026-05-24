import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { KitStock } from '~/entities/kit'
import { createTestKit } from '~/test-utils/factories/kit'
import { renderWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#stub">{children}</a>,
  useNavigate: () => vi.fn(),
}))

import { KitListView } from './KitListView'

function makeStock(kitId: string, count = 1): KitStock {
  return { userId: 'u-1', kitId, count }
}

describe('KitListView (interaction)', () => {
  const kitHg144 = createTestKit({ id: 'kit-1', name: 'RX-78 Gundam', grade: 'HG', scale: '1/144' })
  const kitMg100 = createTestKit({
    id: 'kit-2',
    name: 'Zaku II MG',
    grade: 'MG',
    scale: '1/100',
  })
  const kitRg144 = createTestKit({
    id: 'kit-3',
    name: 'Strike Freedom RG',
    grade: 'RG',
    scale: '1/144',
  })
  const kits = [kitHg144, kitMg100, kitRg144]
  const stocks = [makeStock('kit-1', 2), makeStock('kit-2', 1), makeStock('kit-3', 3)]

  function countLabel() {
    // 「N / M 件」の合致 helper (空白あり)
    return screen.getByText(/\d+ \/ \d+ 件/)
  }

  it('初期表示で全 stock 行のカウントが「3 / 3 件」', () => {
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    expect(countLabel().textContent).toBe('3 / 3 件')
  })

  it('search に "gundam" 入力 → case-insensitive で 1 件マッチ (RX-78 Gundam)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    await user.type(screen.getByPlaceholderText('名前で検索'), 'gundam')
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('search の部分一致 (substring)、スペースなし', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    await user.type(screen.getByPlaceholderText('名前で検索'), 'rg')
    // 'Strike Freedom RG' と 'RX-78 Gundam' (rg ない) → 'Zaku II MG' (ない) → 1 件
    // 'RG' を含むのは Strike Freedom RG のみ
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('search で no match → 「0 / 3 件」', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    await user.type(screen.getByPlaceholderText('名前で検索'), 'NONEXISTENT')
    expect(countLabel().textContent).toBe('0 / 3 件')
  })

  it('grade=HG select → grade 完全一致で 1 件', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    // grade Select: 「すべてのグレード」が初期 → 'HG' へ
    await user.click(screen.getByText('すべてのグレード'))
    // listbox option をクリック
    const hgOption = await screen.findByRole('option', { name: 'HG' })
    await user.click(hgOption)
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('scale=1/144 select → scale 完全一致で 2 件 (HG/144 と RG/144)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    await user.click(screen.getByText('すべてのスケール'))
    const opt = await screen.findByRole('option', { name: '1/144' })
    await user.click(opt)
    expect(countLabel().textContent).toBe('2 / 3 件')
  })

  it('grade=HG + scale=1/144 の AND 適用 → 1 件 (kit-1 のみ)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    await user.click(screen.getByText('すべてのグレード'))
    await user.click(await screen.findByRole('option', { name: 'HG' }))
    await user.click(screen.getByText('すべてのスケール'))
    await user.click(await screen.findByRole('option', { name: '1/144' }))
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('grade=MG + search="zaku" の AND 適用 → 1 件', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    await user.click(screen.getByText('すべてのグレード'))
    await user.click(await screen.findByRole('option', { name: 'MG' }))
    await user.type(screen.getByPlaceholderText('名前で検索'), 'zaku')
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('grade=PG (該当 stock なし) → 0 件 (空 ListView)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    await user.click(screen.getByText('すべてのグレード'))
    await user.click(await screen.findByRole('option', { name: 'PG' }))
    expect(countLabel().textContent).toBe('0 / 3 件')
  })

  it('filter active 時に「クリア」ボタンが表示、未 active 時は非表示', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    expect(screen.queryByRole('button', { name: 'クリア' })).toBeNull()

    await user.type(screen.getByPlaceholderText('名前で検索'), 'gundam')
    expect(screen.getByRole('button', { name: 'クリア' })).toBeTruthy()
  })

  it('クリアボタン押下で filter が initial に戻り全件再表示', async () => {
    const user = userEvent.setup()
    renderWithProviders(<KitListView stocks={stocks} kits={kits} />)
    await user.type(screen.getByPlaceholderText('名前で検索'), 'gundam')
    expect(countLabel().textContent).toBe('1 / 3 件')

    await user.click(screen.getByRole('button', { name: 'クリア' }))
    expect(countLabel().textContent).toBe('3 / 3 件')
    expect(screen.queryByRole('button', { name: 'クリア' })).toBeNull()
  })

  it('stock に対応 kit が無い場合 filter-out (kits 配列に存在しない kitId)', () => {
    const orphanStocks = [...stocks, makeStock('kit-ghost-id', 5)]
    renderWithProviders(<KitListView stocks={orphanStocks} kits={kits} />)
    // 表示は 3 件 (orphan 除外)、source は 4 件
    expect(countLabel().textContent).toBe('3 / 4 件')
  })

  it('stocks 空 → 「0 / 0 件」、空状態のメッセージ表示', () => {
    renderWithProviders(<KitListView stocks={[]} kits={kits} />)
    expect(countLabel().textContent).toBe('0 / 0 件')
    // KitCardList と KitTable 両方の emptyMessage が render される
    expect(screen.getAllByText('該当するキットがありません').length).toBeGreaterThan(0)
  })
})
