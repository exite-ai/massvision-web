import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { Provider } from 'react-redux'
import { store } from './store'
import ProjectListPage from './pages/ProjectListPage'
import { NewProjectPage } from './pages/NewProjectPage'
import MacroPage from './pages/MacroPage'
import { ErrorSnackbar } from './components/ErrorSnackbar'
import TitlePage from './pages/TitlePage'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#1a1a1a',
    },
  },
})

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<TitlePage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:projectId" element={<MacroPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  )
}

export default App 