export interface ProjectTag {
  team: 'Sun' | 'Mass' | 'Others';
  section: '入場' | '1部(男子)' | 'インターバル' | '2部(女子)' | '3部(男女)' | '退場';
  year: number;
}

export interface Character {
  id: number;
  name: string;
  color: string;
  initialPosition: { x: number; y: number };
  initialDirection: number;
}

export interface Macro {
  id: string;
  name: string;
  script: string;
}

export interface Scene {
  id: string;
  name: string;
  macros: Macro[];
  characterMacros: { characterId: number; macroId: string }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tags: ProjectTag;
  createdAt: Date;
  updatedAt: Date;
  characters: Character[];
  scenes: Scene[];
}

class IndexedDBManager {
  private dbName = 'massvision-db'
  private dbVersion = 1
  private storeName = 'projects'
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('データベースのオープンに失敗しました'))
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('name', 'name', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
        }
      }
    })
  }

  async getAllProjects(): Promise<Project[]> {
    if (!this.db) {
      throw new Error('データベースが初期化されていません')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = () => {
        reject(new Error('プロジェクトの取得に失敗しました'))
      }

      request.onsuccess = () => {
        const projects = request.result.map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }))
        resolve(projects)
      }
    })
  }

  async getProject(id: string): Promise<Project | null> {
    if (!this.db) {
      throw new Error('データベースが初期化されていません')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onerror = () => {
        reject(new Error('プロジェクトの取得に失敗しました'))
      }

      request.onsuccess = () => {
        const project = request.result
        if (project) {
          resolve({
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt)
          })
        } else {
          resolve(null)
        }
      }
    })
  }

  async addProject(project: Project): Promise<void> {
    if (!this.db) {
      throw new Error('データベースが初期化されていません')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(project)

      request.onerror = () => {
        reject(new Error('プロジェクトの追加に失敗しました'))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  async updateProject(project: Project): Promise<void> {
    if (!this.db) {
      throw new Error('データベースが初期化されていません')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(project)

      request.onerror = () => {
        reject(new Error('プロジェクトの更新に失敗しました'))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('データベースが初期化されていません')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onerror = () => {
        reject(new Error('プロジェクトの削除に失敗しました'))
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }
}

export const indexedDBManager = new IndexedDBManager() 