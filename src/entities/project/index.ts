export type { Project, ProjectPhoto, ProjectStatus } from './model'
export { PROJECT_STATUS_LABEL } from './model'
export {
  getProjects,
  getProject,
  getProjectPaintUses,
  getProjectPaintIds,
  getProjectPhotos,
  addProject,
  updateProject,
  deleteProject,
  addProjectPaintUse,
  removeProjectPaintUse,
  addProjectPhoto,
  deleteProjectPhoto,
} from './api/mock/projects'
