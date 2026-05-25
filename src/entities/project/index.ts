// project ドメインの public barrel。
//
// 設計原則 (ADR-0008 + #43 Container/Hook/Presenter + #155/#218):
// - **mutation (addProject / updateProject / deleteProject / addProjectPaintUse /
//   removeProjectPaintUse / addProjectPhoto / deleteProjectPhoto) は features/ レイヤー**
//   に置き、本 barrel から export しない
// - mutation を呼ぶ場所は useXxx hook 経由 (view 直 import は depcruise の
//   `fsd-view-component-no-features-direct` rule で機械強制禁止)
// - 本 barrel から mutation を export してしまうと、上記 depcruise 防衛が間接 import
//   で迂回されうるため、ADR-0008 の原則を守って read query / 型 / labels のみ export

export type { Project, ProjectPhoto, ProjectStatus } from './model'
export { PROJECT_STATUS_LABEL } from './model'
export {
  getProjects,
  getProject,
  getProjectPaintUses,
  getProjectPaintIds,
  getProjectPhotos,
} from './api/queries'
