import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  characters: string[]
  macros: string[]
  animations: string[]
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload)
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null
      }
    },
    addCharacterToProject: (state, action: PayloadAction<{ projectId: string; characterId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId)
      if (project) {
        project.characters.push(action.payload.characterId)
      }
    },
    removeCharacterFromProject: (state, action: PayloadAction<{ projectId: string; characterId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId)
      if (project) {
        project.characters = project.characters.filter(id => id !== action.payload.characterId)
      }
    },
    addMacroToProject: (state, action: PayloadAction<{ projectId: string; macroId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId)
      if (project) {
        project.macros.push(action.payload.macroId)
      }
    },
    removeMacroFromProject: (state, action: PayloadAction<{ projectId: string; macroId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId)
      if (project) {
        project.macros = project.macros.filter(id => id !== action.payload.macroId)
      }
    },
    addAnimationToProject: (state, action: PayloadAction<{ projectId: string; animationId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId)
      if (project) {
        project.animations.push(action.payload.animationId)
      }
    },
    removeAnimationFromProject: (state, action: PayloadAction<{ projectId: string; animationId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId)
      if (project) {
        project.animations = project.animations.filter(id => id !== action.payload.animationId)
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    saveProjects: (state) => {
      try {
        localStorage.setItem('projects', JSON.stringify(state.projects))
      } catch (error) {
        state.error = 'プロジェクトの保存に失敗しました'
      }
    },
    loadProjects: (state) => {
      try {
        const savedProjects = localStorage.getItem('projects')
        if (savedProjects) {
          state.projects = JSON.parse(savedProjects)
        }
      } catch (error) {
        state.error = 'プロジェクトの読み込みに失敗しました'
      }
    },
  },
})

export const {
  setProjects,
  setCurrentProject,
  addProject,
  updateProject,
  deleteProject,
  addCharacterToProject,
  removeCharacterFromProject,
  addMacroToProject,
  removeMacroFromProject,
  addAnimationToProject,
  removeAnimationFromProject,
  setLoading,
  setError,
  saveProjects,
  loadProjects,
} = projectSlice.actions

export default projectSlice.reducer 