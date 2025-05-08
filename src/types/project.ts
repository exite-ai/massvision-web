// キャラクターの型定義
export interface Character {
  id: string
  name: string
  color: string
  initial_position: {
    x: number
    y: number
    angle: number
  }
}

// マクロの型定義
export interface Macro {
  id: string
  name: string
  script: string
  assign_chara: string[]
}

// シーンの型定義
export interface Scene {
  id: string
  name: string
  count: number
  macros: Macro[]
}

// プロジェクトの型定義
export interface Project {
  id: string
  project_name: string
  characters: Character[]
  scenes: Scene[]
  created_at: string
  updated_at: string
} 