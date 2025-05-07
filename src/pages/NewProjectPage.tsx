import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material'
import { indexedDBManager, Project } from '../utils/IndexedDBManager'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { ErrorSnackbar } from '../components/ErrorSnackbar'

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim()) {
      setError('プロジェクト名を入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      await indexedDBManager.init()
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectName,
        description: '',
        tags: { team: 'Sun', section: '入場', year: new Date().getFullYear() },
        characters: [],
        scenes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await indexedDBManager.addProject(newProject)
      navigate('/projects')
    } catch (err) {
      setError('プロジェクトの作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            新規プロジェクト作成
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="プロジェクト名"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              margin="normal"
              required
              disabled={isSubmitting}
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                作成
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/projects')}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
      <Footer />
      <ErrorSnackbar
        open={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />
    </>
  )
} 