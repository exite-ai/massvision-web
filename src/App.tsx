import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TitlePage from './pages/TitlePage'
import MainPage from './pages/MainPage'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TitlePage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  )
}

export default App 