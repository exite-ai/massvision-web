import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { indexedDBManager, Project } from '../utils/IndexedDBManager'
import { Box, Button, Container, Typography, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, TextField, Snackbar } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import ShareIcon from '@mui/icons-material/Share'
import { ErrorSnackbar } from '../components/ErrorSnackbar'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import LogoHeader from '../components/LogoHeader'
import logoHorizon from '../image/MASS Vision horizon.png'

type SortField = 'name' | 'createdAt' | 'team' | 'section' | 'year'
type SortOrder = 'asc' | 'desc'

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
  const [editProjectName, setEditProjectName] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const navigate = useNavigate();
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');

  // プロジェクト一覧の取得
  const loadProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await indexedDBManager.init()
      const data = await indexedDBManager.getAllProjects()
      setProjects(data)
    } catch (err) {
      setError('プロジェクト一覧の取得に失敗しました')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // プロジェクトの削除
  const handleDelete = async (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!projectToDelete) return
    try {
      await indexedDBManager.deleteProject(projectToDelete.id)
      await loadProjects()
    } catch (err) {
      setError('プロジェクトの削除に失敗しました')
      console.error(err)
    } finally {
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  // プロジェクトの編集
  const handleEdit = (project: Project) => {
    setProjectToEdit(project)
    setEditProjectName(project.name)
    setEditDialogOpen(true)
  }

  const confirmEdit = async () => {
    if (!projectToEdit || !editProjectName.trim()) return
    try {
      const updatedProject = {
        ...projectToEdit,
        name: editProjectName.trim(),
        updatedAt: new Date()
      }
      await indexedDBManager.updateProject(updatedProject)
      await loadProjects()
    } catch (err) {
      setError('プロジェクトの更新に失敗しました')
      console.error(err)
    } finally {
      setEditDialogOpen(false)
      setProjectToEdit(null)
      setEditProjectName('')
    }
  }

  // プロジェクトの複製
  const handleDuplicate = async (project: Project) => {
    try {
      const newProject = {
        ...project,
        id: Date.now().toString(),
        name: project.name + '_コピー',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await indexedDBManager.addProject(newProject)
      await loadProjects()
    } catch (err) {
      setError('プロジェクトの複製に失敗しました')
      console.error(err)
    }
  }

  // プロジェクトのエクスポート
  const handleExport = async (project: Project) => {
    try {
      const dataStr = JSON.stringify(project, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const exportFileDefaultName = `${project.name}.json`
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    } catch (err) {
      setError('プロジェクトのエクスポートに失敗しました')
      console.error(err)
    }
  }

  // プロジェクトのインポート
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const importedProject = JSON.parse(text)
      await indexedDBManager.addProject({
        ...importedProject,
        createdAt: new Date(importedProject.createdAt),
        updatedAt: new Date(importedProject.updatedAt)
      })
      await loadProjects()
    } catch (err) {
      setError('プロジェクトのインポートに失敗しました')
      console.error(err)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // プロジェクトの共有
  // const handleShare = async (project: Project) => {
  //   try {
  //     const link = await generateShareLink(project.id)
  //     setShareLink(link)
  //     setShareDialogOpen(true)
  //   } catch (err) {
  //     setError('共有リンクの生成に失敗しました')
  //     console.error(err)
  //   }
  // }

  // 共有リンクのコピー
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopySuccess(true)
    } catch (err) {
      setError('リンクのコピーに失敗しました')
      console.error(err)
    }
  }

  // ソートと検索を適用したプロジェクト一覧を取得
  const getFilteredAndSortedProjects = () => {
    return [...projects]
      .filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterTeam === '' || project.tags.team === filterTeam) &&
        (filterSection === '' || project.tags.section === filterSection) &&
        (filterYear === '' || String(project.tags.year) === filterYear)
      )
      .sort((a, b) => {
        if (sortField === 'createdAt') {
          const aTime = (a.createdAt instanceof Date) ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = (b.createdAt instanceof Date) ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return (aTime - bTime) * (sortOrder === 'asc' ? 1 : -1);
        } else if (sortField === 'team') {
          return a.tags.team.localeCompare(b.tags.team) * (sortOrder === 'asc' ? 1 : -1);
        } else if (sortField === 'section') {
          return a.tags.section.localeCompare(b.tags.section) * (sortOrder === 'asc' ? 1 : -1);
        } else if (sortField === 'year') {
          return (a.tags.year - b.tags.year) * (sortOrder === 'asc' ? 1 : -1);
        } else {
          return a.name.localeCompare(b.name) * (sortOrder === 'asc' ? 1 : -1);
        }
      })
  }

  useEffect(() => {
    loadProjects()
  }, [])

  if (isLoading) {
    return (
      <Container>
        <Typography>読み込み中...</Typography>
      </Container>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LogoHeader logoSrc={logoHorizon}>
        <Button
          component={Link}
          to="/projects/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          新規プロジェクト
        </Button>
      </LogoHeader>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        {error && <ErrorSnackbar open={!!error} message={error} onClose={() => setError(null)} />}
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ color: 'white' }}>
              プロジェクト一覧
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImport}
              />
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', opacity: 0.8 } }}
              >
                インポート
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="プロジェクト名で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'white', mr: 1 }} />,
                sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }
              }}
              sx={{ flexGrow: 1, minWidth: 180 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'white' }}>チーム</InputLabel>
              <Select
                value={filterTeam}
                label="チーム"
                onChange={(e) => setFilterTeam(e.target.value)}
                sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                <MenuItem value="">全て</MenuItem>
                <MenuItem value="Sun">Sun</MenuItem>
                <MenuItem value="Mass">Mass</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'white' }}>部</InputLabel>
              <Select
                value={filterSection}
                label="部"
                onChange={(e) => setFilterSection(e.target.value)}
                sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                <MenuItem value="">全て</MenuItem>
                <MenuItem value="入場">入場</MenuItem>
                <MenuItem value="1部(男子)">1部(男子)</MenuItem>
                <MenuItem value="インターバル">インターバル</MenuItem>
                <MenuItem value="2部(女子)">2部(女子)</MenuItem>
                <MenuItem value="3部(男女)">3部(男女)</MenuItem>
                <MenuItem value="退場">退場</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ color: 'white' }}>年</InputLabel>
              <Select
                value={filterYear}
                label="年"
                onChange={(e) => setFilterYear(e.target.value)}
                sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                <MenuItem value="">全て</MenuItem>
                {Array.from(new Set(projects.map(p => p.tags.year))).sort((a, b) => b - a).map(year => (
                  <MenuItem key={year} value={String(year)}>{year}年</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'white' }}>並び替え</InputLabel>
              <Select
                value={sortField}
                label="並び替え"
                onChange={(e) => setSortField(e.target.value as SortField)}
                sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                <MenuItem value="name">プロジェクト名</MenuItem>
                <MenuItem value="createdAt">作成日</MenuItem>
                <MenuItem value="team">チーム</MenuItem>
                <MenuItem value="section">部</MenuItem>
                <MenuItem value="year">年</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ color: 'white' }}>順序</InputLabel>
              <Select
                value={sortOrder}
                label="順序"
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                <MenuItem value="asc">昇順</MenuItem>
                <MenuItem value="desc">降順</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <List>
            {getFilteredAndSortedProjects().map((project) => (
              <ListItem
                key={project.id}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  mb: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                onClick={() => navigate(`/projects/${project.id}`)}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* <IconButton
                      edge="end"
                      aria-label="share"
                      onClick={() => handleShare(project)}
                      sx={{ color: 'white' }}
                    >
                      <ShareIcon />
                    </IconButton> */}
                    <IconButton
                      edge="end"
                      aria-label="export"
                      onClick={(e) => { e.stopPropagation(); handleExport(project); }}
                      sx={{ color: 'white' }}
                    >
                      <FileDownloadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="duplicate"
                      onClick={(e) => { e.stopPropagation(); handleDuplicate(project); }}
                      sx={{ color: 'white' }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                      sx={{ color: 'white' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => { e.stopPropagation(); handleDelete(project); }}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', display: 'inline-block', mr: 2 }}>
                        {project.name}
                      </Typography>
                      <Box component="span" sx={{ color: '#90caf9', fontSize: '0.95rem', ml: 1 }}>
                        [{project.tags.team} / {project.tags.section} / {project.tags.year}年]
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      作成日: {new Date(project.createdAt).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Container>
      <Footer />

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'white',
          },
        }}
      >
        <DialogTitle>プロジェクトの削除</DialogTitle>
        <DialogContent>
          <Typography>
            {projectToDelete?.name}を削除してもよろしいですか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'white' }}>
            キャンセル
          </Button>
          <Button onClick={confirmDelete} color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'white',
          },
        }}
      >
        <DialogTitle>プロジェクト名の編集</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="プロジェクト名"
            fullWidth
            value={editProjectName}
            onChange={(e) => setEditProjectName(e.target.value)}
            error={!editProjectName.trim()}
            helperText={!editProjectName.trim() ? 'プロジェクト名を入力してください' : ''}
            sx={{
              '& .MuiInputLabel-root': { color: 'white' },
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'white' },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: 'white' }}>
            キャンセル
          </Button>
          <Button
            onClick={confirmEdit}
            disabled={!editProjectName.trim()}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 共有ダイアログ */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'white',
          },
        }}
      >
        <DialogTitle>プロジェクトの共有</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              以下のリンクを共有することで、他のユーザーがこのプロジェクトにアクセスできます。
            </Typography>
            <TextField
              fullWidth
              value={shareLink}
              InputProps={{
                readOnly: true,
                sx: { color: 'white' },
              }}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)} sx={{ color: 'white' }}>
            閉じる
          </Button>
          <Button onClick={handleCopyLink} startIcon={<ContentCopyIcon />}>
            コピー
          </Button>
        </DialogActions>
      </Dialog>

      {/* コピー成功通知 */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="リンクをコピーしました"
      />
    </Box>
  )
}

export default ProjectListPage 