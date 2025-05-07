import { Project } from '../types/project'

const API_BASE_URL = '/api'

// モックデータの初期化
const initialMockProjects: Project[] = [
  {
    id: 'p1',
    project_name: 'サンプルプロジェクト1',
    characters: [],
    scenes: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p2',
    project_name: 'サンプルプロジェクト2',
    characters: [],
    scenes: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// モックデータの保存用
let mockProjects: Project[] = [...initialMockProjects]

// プロジェクト一覧の取得
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`)
    if (!response.ok) {
      throw new Error('プロジェクト一覧の取得に失敗しました')
    }
    return await response.json()
  } catch (error) {
    console.error('プロジェクト一覧の取得に失敗:', error)
    throw new Error('プロジェクト一覧の取得に失敗しました')
  }
}

// プロジェクトの取得
export const getProject = async (id: string): Promise<Project> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`)
    if (!response.ok) {
      throw new Error('プロジェクトが見つかりません')
    }
    return await response.json()
  } catch (error) {
    console.error('プロジェクトの取得に失敗:', error)
    throw new Error('プロジェクトの取得に失敗しました')
  }
}

// プロジェクトの作成
export const createProject = async (projectName: string): Promise<Project> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_name: projectName,
      }),
    })
    if (!response.ok) {
      throw new Error('プロジェクトの作成に失敗しました')
    }
    return await response.json()
  } catch (error) {
    console.error('プロジェクトの作成に失敗:', error)
    throw new Error('プロジェクトの作成に失敗しました')
  }
}

// プロジェクトの更新
export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('プロジェクトの更新に失敗しました')
    }
    return await response.json()
  } catch (error) {
    console.error('プロジェクトの更新に失敗:', error)
    throw new Error('プロジェクトの更新に失敗しました')
  }
}

// プロジェクトの削除
export const deleteProject = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('プロジェクトの削除に失敗しました')
    }
  } catch (error) {
    console.error('プロジェクトの削除に失敗:', error)
    throw new Error('プロジェクトの削除に失敗しました')
  }
}

// プロジェクトの複製
export const duplicateProject = async (id: string): Promise<Project> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/duplicate`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('プロジェクトの複製に失敗しました')
    }
    return await response.json()
  } catch (error) {
    console.error('プロジェクトの複製に失敗:', error)
    throw new Error('プロジェクトの複製に失敗しました')
  }
}

// プロジェクトのエクスポート
export const exportProject = async (id: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/export`)
    if (!response.ok) {
      throw new Error('プロジェクトのエクスポートに失敗しました')
    }
    return await response.blob()
  } catch (error) {
    console.error('プロジェクトのエクスポートに失敗:', error)
    throw new Error('プロジェクトのエクスポートに失敗しました')
  }
}

// プロジェクトのインポート
export const importProject = async (file: File): Promise<Project> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/projects/import`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error('プロジェクトのインポートに失敗しました')
    }
    return await response.json()
  } catch (error) {
    console.error('プロジェクトのインポートに失敗:', error)
    throw new Error('プロジェクトのインポートに失敗しました')
  }
}

// プロジェクトの共有リンク生成
export const generateShareLink = async (id: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/share`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('共有リンクの生成に失敗しました')
    }
    const data = await response.json()
    return data.shareLink
  } catch (error) {
    console.error('共有リンクの生成に失敗:', error)
    throw new Error('共有リンクの生成に失敗しました')
  }
}

// 共有リンクからプロジェクトを取得
export const getProjectFromShareLink = async (shareLink: string): Promise<Project> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/share/${shareLink}`)
    if (!response.ok) {
      throw new Error('プロジェクトの取得に失敗しました')
    }
    return await response.json()
  } catch (error) {
    console.error('プロジェクトの取得に失敗:', error)
    throw new Error('プロジェクトの取得に失敗しました')
  }
} 