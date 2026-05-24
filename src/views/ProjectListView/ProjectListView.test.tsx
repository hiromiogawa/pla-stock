import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createTestProject } from '~/test-utils/factories/project'
import { renderWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#stub">{children}</a>,
  useNavigate: () => vi.fn(),
}))

import { ProjectListView } from './ProjectListView'

describe('ProjectListView (interaction)', () => {
  const planningRx = createTestProject({
    id: 'p-1',
    name: 'RX-78 Build',
    status: 'planning',
  })
  const buildingZaku = createTestProject({
    id: 'p-2',
    name: 'Zaku Custom',
    status: 'building',
  })
  const completedStrike = createTestProject({
    id: 'p-3',
    name: 'Strike Freedom',
    status: 'completed',
  })
  const abandonedFreedom = createTestProject({
    id: 'p-4',
    name: 'Aile Strike',
    status: 'abandoned',
  })
  const projects = [planningRx, buildingZaku, completedStrike, abandonedFreedom]
  const kitNameByProjectId: Record<string, string | null> = {
    'p-1': 'RX-78 HG',
    'p-2': 'Zaku MG',
    'p-3': null,
    'p-4': 'Strike RG',
  }
  const kitBoxArtByProjectId: Record<string, string | null> = {
    'p-1': null,
    'p-2': null,
    'p-3': null,
    'p-4': null,
  }

  function countLabel() {
    return screen.getByText(/\d+ \/ \d+ 件/)
  }

  function render() {
    return renderWithProviders(
      <ProjectListView
        projects={projects}
        kitNameByProjectId={kitNameByProjectId}
        kitBoxArtByProjectId={kitBoxArtByProjectId}
      />,
    )
  }

  it('初期表示で 4 件 (全 status)', () => {
    render()
    expect(countLabel().textContent).toBe('4 / 4 件')
  })

  it('search="zaku" → name 部分一致で 1 件 (case-insensitive)', async () => {
    const user = userEvent.setup()
    render()
    await user.type(screen.getByPlaceholderText('名前で検索'), 'zaku')
    expect(countLabel().textContent).toBe('1 / 4 件')
  })

  it('search="strike" → 2 件 (Strike Freedom と Aile Strike が両方マッチ)', async () => {
    const user = userEvent.setup()
    render()
    await user.type(screen.getByPlaceholderText('名前で検索'), 'strike')
    expect(countLabel().textContent).toBe('2 / 4 件')
  })

  it('status=計画中 (planning) → 1 件', async () => {
    const user = userEvent.setup()
    render()
    await user.click(screen.getByText('すべてのステータス'))
    await user.click(await screen.findByRole('option', { name: '計画中' }))
    expect(countLabel().textContent).toBe('1 / 4 件')
  })

  it('status=製作中 (building) → 1 件', async () => {
    const user = userEvent.setup()
    render()
    await user.click(screen.getByText('すべてのステータス'))
    await user.click(await screen.findByRole('option', { name: '製作中' }))
    expect(countLabel().textContent).toBe('1 / 4 件')
  })

  it('status=完成 (completed) → 1 件', async () => {
    const user = userEvent.setup()
    render()
    await user.click(screen.getByText('すべてのステータス'))
    await user.click(await screen.findByRole('option', { name: '完成' }))
    expect(countLabel().textContent).toBe('1 / 4 件')
  })

  it('status=頓挫 (abandoned) → 1 件', async () => {
    const user = userEvent.setup()
    render()
    await user.click(screen.getByText('すべてのステータス'))
    await user.click(await screen.findByRole('option', { name: '頓挫' }))
    expect(countLabel().textContent).toBe('1 / 4 件')
  })

  it('search="strike" + status=完成 の AND → 1 件 (Strike Freedom のみ)', async () => {
    const user = userEvent.setup()
    render()
    await user.type(screen.getByPlaceholderText('名前で検索'), 'strike')
    await user.click(screen.getByText('すべてのステータス'))
    await user.click(await screen.findByRole('option', { name: '完成' }))
    expect(countLabel().textContent).toBe('1 / 4 件')
  })

  it('search="strike" + status=頓挫 → 1 件 (Aile Strike)', async () => {
    const user = userEvent.setup()
    render()
    await user.type(screen.getByPlaceholderText('名前で検索'), 'strike')
    await user.click(screen.getByText('すべてのステータス'))
    await user.click(await screen.findByRole('option', { name: '頓挫' }))
    expect(countLabel().textContent).toBe('1 / 4 件')
  })

  it('status=計画中 で search="no-match" → 0 件 (AND が空集合に)', async () => {
    const user = userEvent.setup()
    render()
    await user.click(screen.getByText('すべてのステータス'))
    await user.click(await screen.findByRole('option', { name: '計画中' }))
    await user.type(screen.getByPlaceholderText('名前で検索'), 'NONEXISTENT')
    expect(countLabel().textContent).toBe('0 / 4 件')
  })

  it('クリアボタンの表示/非表示と reset 動作', async () => {
    const user = userEvent.setup()
    render()
    expect(screen.queryByRole('button', { name: 'クリア' })).toBeNull()

    await user.type(screen.getByPlaceholderText('名前で検索'), 'zaku')
    expect(screen.getByRole('button', { name: 'クリア' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'クリア' }))
    expect(countLabel().textContent).toBe('4 / 4 件')
    expect(screen.queryByRole('button', { name: 'クリア' })).toBeNull()
  })

  it('status 単独 active でも クリアボタン 表示', async () => {
    const user = userEvent.setup()
    render()
    await user.click(screen.getByText('すべてのステータス'))
    await user.click(await screen.findByRole('option', { name: '完成' }))
    expect(screen.getByRole('button', { name: 'クリア' })).toBeTruthy()
  })

  it('projects 空 → 「0 / 0 件」、空メッセージ表示', () => {
    renderWithProviders(
      <ProjectListView projects={[]} kitNameByProjectId={{}} kitBoxArtByProjectId={{}} />,
    )
    expect(countLabel().textContent).toBe('0 / 0 件')
    expect(screen.getAllByText('該当するプロジェクトがありません').length).toBeGreaterThan(0)
  })

  it('status select の option 一覧 (4 status + all) が日本語 label で表示', async () => {
    const user = userEvent.setup()
    render()
    await user.click(screen.getByText('すべてのステータス'))
    const options = await screen.findAllByRole('option')
    const labels = options.map((opt) => opt.textContent ?? '')
    expect(labels).toContain('すべてのステータス')
    expect(labels).toContain('計画中')
    expect(labels).toContain('製作中')
    expect(labels).toContain('完成')
    expect(labels).toContain('頓挫')
    expect(labels.length).toBe(5)
  })
})
