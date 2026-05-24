import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { PaintStock } from '~/entities/paint'
import { createTestPaint } from '~/test-utils/factories/paint'
import { renderWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#stub">{children}</a>,
  useNavigate: () => vi.fn(),
}))

import { PaintListView } from './PaintListView'

function makeStock(paintId: string, count = 1): PaintStock {
  return { userId: 'u-1', paintId, count }
}

describe('PaintListView (interaction)', () => {
  const paintGsiRedGloss = createTestPaint({
    id: 'paint-1',
    brand: 'GSI Creos',
    code: 'H001',
    name: 'White',
    colorFamily: '白',
    finishType: '光沢',
  })
  const paintGsiBlackMatte = createTestPaint({
    id: 'paint-2',
    brand: 'GSI Creos',
    code: 'H012',
    name: 'Semi Gloss Black',
    colorFamily: '黒',
    finishType: '半光沢',
  })
  const paintTamiyaSilver = createTestPaint({
    id: 'paint-3',
    brand: 'Tamiya',
    code: 'X-11',
    name: 'Chrome Silver',
    colorFamily: '銀',
    finishType: 'メタリック',
  })
  const paints = [paintGsiRedGloss, paintGsiBlackMatte, paintTamiyaSilver]
  const stocks = [makeStock('paint-1'), makeStock('paint-2'), makeStock('paint-3')]

  function countLabel() {
    return screen.getByText(/\d+ \/ \d+ 件/)
  }

  it('初期表示で全件「3 / 3 件」', () => {
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    expect(countLabel().textContent).toBe('3 / 3 件')
  })

  it('search="white" → name 部分一致 1 件 (case-insensitive)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.type(screen.getByPlaceholderText('名前 / コードで検索'), 'white')
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('search="X-11" → code 部分一致 1 件 (name でなく code でも match する仕様)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.type(screen.getByPlaceholderText('名前 / コードで検索'), 'X-11')
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('search="ABSENT" → 0 件', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.type(screen.getByPlaceholderText('名前 / コードで検索'), 'ABSENT')
    expect(countLabel().textContent).toBe('0 / 3 件')
  })

  it('brand=Tamiya 選択 → 完全一致 1 件', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.click(screen.getByText('すべてのブランド'))
    await user.click(await screen.findByRole('option', { name: 'Tamiya' }))
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('colorFamily=白 → 1 件 (paint-1 のみ)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.click(screen.getByText('すべての色系統'))
    await user.click(await screen.findByRole('option', { name: '白' }))
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('finishType=メタリック → 1 件', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.click(screen.getByText('すべてのフィニッシュ'))
    await user.click(await screen.findByRole('option', { name: 'メタリック' }))
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('brand=GSI Creos + finishType=光沢 の AND → 1 件 (paint-1)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.click(screen.getByText('すべてのブランド'))
    await user.click(await screen.findByRole('option', { name: 'GSI Creos' }))
    await user.click(screen.getByText('すべてのフィニッシュ'))
    await user.click(await screen.findByRole('option', { name: '光沢' }))
    expect(countLabel().textContent).toBe('1 / 3 件')
  })

  it('brand=GSI Creos だけで 2 件、他 filter なし', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.click(screen.getByText('すべてのブランド'))
    await user.click(await screen.findByRole('option', { name: 'GSI Creos' }))
    expect(countLabel().textContent).toBe('2 / 3 件')
  })

  it('brand options は paints から dedupe + sort で生成される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    await user.click(screen.getByText('すべてのブランド'))
    // listbox の options
    const optionList = await screen.findAllByRole('option')
    const labels = optionList.map((el) => el.textContent ?? '')
    // 'すべてのブランド' + brands
    expect(labels).toContain('すべてのブランド')
    expect(labels).toContain('GSI Creos')
    expect(labels).toContain('Tamiya')
    // ブランド重複なし (GSI Creos は 2 paint で使われているが 1 件のみ)
    const gsiCount = labels.filter((label) => label === 'GSI Creos').length
    expect(gsiCount).toBe(1)
  })

  it('「クリア」ボタンの表示/非表示と reset 後の全件復帰', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaintListView stocks={stocks} paints={paints} />)
    expect(screen.queryByRole('button', { name: 'クリア' })).toBeNull()

    await user.type(screen.getByPlaceholderText('名前 / コードで検索'), 'white')
    expect(countLabel().textContent).toBe('1 / 3 件')

    await user.click(screen.getByRole('button', { name: 'クリア' }))
    expect(countLabel().textContent).toBe('3 / 3 件')
  })

  it('stocks 空 → 「0 / 0 件」、空メッセージ表示', () => {
    renderWithProviders(<PaintListView stocks={[]} paints={paints} />)
    expect(countLabel().textContent).toBe('0 / 0 件')
    expect(screen.getAllByText('該当する塗料がありません').length).toBeGreaterThan(0)
  })

  it('stock に対応 paint が無い場合 filter-out', () => {
    const orphanStocks = [...stocks, makeStock('paint-ghost-id')]
    renderWithProviders(<PaintListView stocks={orphanStocks} paints={paints} />)
    expect(countLabel().textContent).toBe('3 / 4 件')
  })
})
