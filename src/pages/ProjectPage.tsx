import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { indexedDBManager, Project } from '../utils/IndexedDBManager'
import '../styles/ProjectPage.css'
import LogoHeader from '../components/LogoHeader'
import logoHorizon from '../image/MASS Vision horizon.png'

type SortOption = 'name' | 'createdAt' | 'updatedAt' | 'year'
type SortOrder = 'asc' | 'desc'

const TEAM_OPTIONS = ['Sun', 'Moon', 'Others'] as const
const SECTION_OPTIONS = ['入場', '1部(男子)', 'インターバル', '2部(女子)', '3部(男女)', '退場'] as const
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 1899 + 1 },
  (_, i) => CURRENT_YEAR + 1 - i
)

const ProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectTags, setNewProjectTags] = useState<Project['tags']>({
    team: 'Sun',
    section: '入場',
    year: CURRENT_YEAR
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterTags, setFilterTags] = useState<Partial<Project['tags']>>({})

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await indexedDBManager.init()
        const allProjects = await indexedDBManager.getAllProjects()
        setProjects(allProjects)
        setFilteredProjects(allProjects)
      } catch (err) {
        setError('データベースの初期化に失敗しました')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeDB()
  }, [])

  useEffect(() => {
    let result = [...projects]
    
    // 検索フィルタリング
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
      )
    }

    // タグフィルタリング
    if (filterTags.team) {
      result = result.filter(project => project.tags.team === filterTags.team)
    }
    if (filterTags.section) {
      result = result.filter(project => project.tags.section === filterTags.section)
    }
    if (filterTags.year) {
      result = result.filter(project => project.tags.year === filterTags.year)
    }

    // 並び替え
    result.sort((a, b) => {
      let comparison = 0
      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
          break
        case 'year':
          comparison = a.tags.year - b.tags.year
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredProjects(result)
  }, [projects, searchQuery, sortOption, sortOrder, filterTags])

  const handleCreateProject = async () => {
    try {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName,
        description: newProjectDescription,
        tags: newProjectTags,
        characters: [],
        scenes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await indexedDBManager.addProject(newProject)
      setProjects([...projects, newProject])
      setIsCreateModalOpen(false)
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectTags({
        team: 'Sun',
        section: '入場',
        year: CURRENT_YEAR
      })
    } catch (err) {
      setError('プロジェクトの作成に失敗しました')
      console.error(err)
    }
  }

  const handleEditProject = async () => {
    if (!editingProject) return

    try {
      const updatedProject = {
        ...editingProject,
        name: newProjectName,
        description: newProjectDescription,
        tags: newProjectTags,
        updatedAt: new Date()
      }
      await indexedDBManager.updateProject(updatedProject)
      setProjects(projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      ))
      setIsEditModalOpen(false)
      setEditingProject(null)
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectTags({
        team: 'Sun',
        section: '入場',
        year: CURRENT_YEAR
      })
    } catch (err) {
      setError('プロジェクトの更新に失敗しました')
      console.error(err)
    }
  }

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project)
    setNewProjectName(project.name)
    setNewProjectDescription(project.description)
    setNewProjectTags(project.tags)
    setIsEditModalOpen(true)
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/main?project=${projectId}`)
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await indexedDBManager.deleteProject(projectId)
      setProjects(projects.filter(project => project.id !== projectId))
    } catch (err) {
      setError('プロジェクトの削除に失敗しました')
      console.error(err)
    }
  }

  const handleExportProjects = () => {
    const dataStr = JSON.stringify(projects, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'projects.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportProjects = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedProjects = JSON.parse(text)
      
      if (!Array.isArray(importedProjects)) {
        throw new Error('無効なプロジェクトデータです')
      }

      const existingIds = new Set(projects.map(p => p.id))
      const newProjects = importedProjects.filter((p: Project) => !existingIds.has(p.id))
      
      for (const project of newProjects) {
        await indexedDBManager.addProject({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        })
      }

      setProjects([...projects, ...newProjects])
      event.target.value = ''
    } catch (err) {
      setError('プロジェクトのインポートに失敗しました')
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="project-page">
        <div className="loading">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="project-page">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="project-page">
      <LogoHeader logoSrc={logoHorizon}>
        <button className="back-button" onClick={() => navigate('/')}>タイトルに戻る</button>
      </LogoHeader>
      <div className="project-list">
        <div className="project-list-header">
          <h2>プロジェクト一覧</h2>
          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="プロジェクトを検索..."
              />
            </div>
            <div className="filter-controls">
              <select
                value={filterTags.team || ''}
                onChange={(e) => setFilterTags(prev => ({
                  ...prev,
                  team: e.target.value as Project['tags']['team'] || undefined
                }))}
              >
                <option value="">チーム: すべて</option>
                {TEAM_OPTIONS.map(team => (
                  <option key={team} value={team}>チーム: {team}</option>
                ))}
              </select>
              <select
                value={filterTags.section || ''}
                onChange={(e) => setFilterTags(prev => ({
                  ...prev,
                  section: e.target.value as Project['tags']['section'] || undefined
                }))}
              >
                <option value="">部: すべて</option>
                {SECTION_OPTIONS.map(section => (
                  <option key={section} value={section}>部: {section}</option>
                ))}
              </select>
              <select
                value={filterTags.year || ''}
                onChange={(e) => setFilterTags(prev => ({
                  ...prev,
                  year: e.target.value ? parseInt(e.target.value) : undefined
                }))}
              >
                <option value="">年: すべて</option>
                {YEAR_OPTIONS.map(year => (
                  <option key={year} value={year}>年: {year}</option>
                ))}
              </select>
            </div>
            <div className="sort-controls">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
              >
                <option value="name">名前</option>
                <option value="createdAt">作成日</option>
                <option value="updatedAt">更新日</option>
                <option value="year">年</option>
              </select>
              <button
                className="sort-order-button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            <div className="import-export">
              <label className="import-button">
                インポート
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProjects}
                  style={{ display: 'none' }}
                />
              </label>
              <button className="export-button" onClick={handleExportProjects}>
                エクスポート
              </button>
            </div>
            <button 
              className="create-button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              新規プロジェクト作成
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="no-projects">
            <p>プロジェクトがありません</p>
            <p>「新規プロジェクト作成」ボタンをクリックして作成してください</p>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p className="description">{project.description}</p>
                <div className="project-tags">
                  <span className="tag team">{project.tags.team}</span>
                  <span className="tag section">{project.tags.section}</span>
                  <span className="tag year">{project.tags.year}年</span>
                </div>
                <div className="project-info">
                  <p>作成日: {project.createdAt.toLocaleDateString()}</p>
                  <p>更新日: {project.updatedAt.toLocaleDateString()}</p>
                </div>
                <div className="project-actions">
                  <button 
                    className="open-button"
                    onClick={() => handleOpenProject(project.id)}
                  >
                    開く
                  </button>
                  <button 
                    className="edit-button"
                    onClick={() => handleOpenEditModal(project)}
                  >
                    編集
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>新規プロジェクト作成</h2>
            <div className="form-group">
              <label>プロジェクト名</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="プロジェクト名を入力"
              />
            </div>
            <div className="form-group">
              <label>説明</label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="プロジェクトの説明を入力"
              />
            </div>
            <div className="form-group">
              <label>チーム</label>
              <select
                value={newProjectTags.team}
                onChange={(e) => setNewProjectTags(prev => ({
                  ...prev,
                  team: e.target.value as Project['tags']['team']
                }))}
              >
                {TEAM_OPTIONS.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>部</label>
              <select
                value={newProjectTags.section}
                onChange={(e) => setNewProjectTags(prev => ({
                  ...prev,
                  section: e.target.value as Project['tags']['section']
                }))}
              >
                {SECTION_OPTIONS.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>年</label>
              <select
                value={newProjectTags.year}
                onChange={(e) => setNewProjectTags(prev => ({
                  ...prev,
                  year: parseInt(e.target.value)
                }))}
              >
                {YEAR_OPTIONS.map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setIsCreateModalOpen(false)}
              >
                キャンセル
              </button>
              <button 
                className="create-button"
                onClick={handleCreateProject}
                disabled={!newProjectName}
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingProject && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>プロジェクト編集</h2>
            <div className="form-group">
              <label>プロジェクト名</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="プロジェクト名を入力"
              />
            </div>
            <div className="form-group">
              <label>説明</label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="プロジェクトの説明を入力"
              />
            </div>
            <div className="form-group">
              <label>チーム</label>
              <select
                value={newProjectTags.team}
                onChange={(e) => setNewProjectTags(prev => ({
                  ...prev,
                  team: e.target.value as Project['tags']['team']
                }))}
              >
                {TEAM_OPTIONS.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>部</label>
              <select
                value={newProjectTags.section}
                onChange={(e) => setNewProjectTags(prev => ({
                  ...prev,
                  section: e.target.value as Project['tags']['section']
                }))}
              >
                {SECTION_OPTIONS.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>年</label>
              <select
                value={newProjectTags.year}
                onChange={(e) => setNewProjectTags(prev => ({
                  ...prev,
                  year: parseInt(e.target.value)
                }))}
              >
                {YEAR_OPTIONS.map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingProject(null)
                  setNewProjectName('')
                  setNewProjectDescription('')
                  setNewProjectTags({
                    team: 'Sun',
                    section: '入場',
                    year: CURRENT_YEAR
                  })
                }}
              >
                キャンセル
              </button>
              <button 
                className="edit-button"
                onClick={handleEditProject}
                disabled={!newProjectName}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
      <footer className="footer">
        MASS Vision version 5.0 ©️S.K. / EXiTE programming.
      </footer>
    </div>
  )
}

export default ProjectPage 