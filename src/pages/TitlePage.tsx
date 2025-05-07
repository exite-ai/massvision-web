import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/TitlePage.css'

const TitlePage: React.FC = () => {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/main')
  }

  return (
    <div className="title-page">
      <div className="title-content">
        <h1>MASS Vision</h1>
        <h2>version 4.0</h2>
        <div className="logo">
          {/* ロゴ画像をここに配置 */}
        </div>
        <div className="copyright">
          © 2024 MASS Vision
        </div>
        <button className="start-button" onClick={handleStart}>
          はじめる
        </button>
      </div>
    </div>
  )
}

export default TitlePage 