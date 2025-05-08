import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/TitlePage.css'
import logoSquare from '../image/MASS Vision Square.png'

const FADEIN_DURATION = 2000 // ms
const WAIT_AFTER_FADE = 800 // ms

const TitlePage: React.FC = () => {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const skipRef = useRef(false)

  useEffect(() => {
    setVisible(true)
    // アニメーション後に遷移
    timeoutRef.current = setTimeout(() => {
      if (!skipRef.current) {
        navigate('/projects')
      }
    }, FADEIN_DURATION + WAIT_AFTER_FADE)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [navigate])

  const handleSkip = () => {
    if (skipRef.current) return
    skipRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(true)
    navigate('/projects')
  }

  return (
    <div className="title-page" style={{ background: '#000', minHeight: '100vh', width: '100vw' }} onClick={handleSkip} onTouchStart={handleSkip}>
      <img
        src={logoSquare}
        alt="MASS Vision ロゴ"
        className={`title-fadein-logo${visible ? ' visible' : ''}`}
        draggable={false}
      />
    </div>
  )
}

export default TitlePage 