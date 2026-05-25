import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Kit } from '~/entities/kit'
import type { Project } from '~/entities/project'
import { createTestKit } from '~/test-utils/factories/kit'
import { createTestProject } from '~/test-utils/factories/project'
import { renderWithProviders } from '~/test-utils/react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="#stub">{children}</a>,
  useNavigate: () => vi.fn(),
}))

import { ProjectDetailView } from './ProjectDetailView'

describe('ProjectDetailView — partial errors banner (#167)', () => {
  const project: Project = createTestProject({
    id: 'p-1',
    name: 'My Build',
    status: 'building',
  })
  const kit: Kit = createTestKit({ id: 'kit-1', name: 'RX-78' })
  const noopHookProps = {
    editing: false,
    showDeleteDialog: false,
    setEditing: vi.fn(),
    setShowDeleteDialog: vi.fn(),
    handleSave: vi.fn(),
    handleDelete: vi.fn(),
    handleAddPaint: vi.fn(),
    handleRemovePaint: vi.fn(),
    handleAddPhoto: vi.fn(),
    handleRemovePhoto: vi.fn(),
    handleBackToList: vi.fn(),
  }

  it('errors 空 → 部分失敗 Alert は表示されない (通常画面)', () => {
    renderWithProviders(
      <ProjectDetailView
        project={project}
        kit={kit}
        paintsForProject={[]}
        allPaints={[]}
        photos={[]}
        errors={{}}
        {...noopHookProps}
      />,
    )
    expect(screen.queryByText('一部データの取得に失敗しました')).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'My Build' })).toBeTruthy()
  })

  it('errors.paintUses あり → warning Alert 表示 + メッセージ含む', () => {
    renderWithProviders(
      <ProjectDetailView
        project={project}
        kit={kit}
        paintsForProject={[]}
        allPaints={[]}
        photos={[]}
        errors={{ paintUses: 'D1 read failed' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText('一部データの取得に失敗しました')).toBeTruthy()
    expect(screen.getByText(/D1 read failed/)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'My Build' })).toBeTruthy()
  })

  it('errors.photos + errors.allPaints の 2 件 → 両方の error メッセージが表示', () => {
    renderWithProviders(
      <ProjectDetailView
        project={project}
        kit={kit}
        paintsForProject={[]}
        allPaints={[]}
        photos={[]}
        errors={{ photos: 'r2 down', allPaints: 'paint master 404' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText(/r2 down/)).toBeTruthy()
    expect(screen.getByText(/paint master 404/)).toBeTruthy()
  })

  it('project が null → "プロジェクトが見つかりません" 画面 (errors の有無に関わらず)', () => {
    renderWithProviders(
      <ProjectDetailView
        project={null}
        kit={null}
        paintsForProject={[]}
        allPaints={[]}
        photos={[]}
        errors={{ kit: 'irrelevant in not-found state' }}
        {...noopHookProps}
      />,
    )
    expect(screen.getByText('プロジェクトが見つかりません')).toBeTruthy()
  })
})
