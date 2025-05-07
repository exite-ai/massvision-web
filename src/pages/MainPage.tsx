import React, { useState, useRef, useEffect } from 'react'
import '../styles/MainPage.css'
import LogoHeader from '../components/LogoHeader'
import logoHorizon from '../image/MASS Vision horizon.png'
import { useNavigate } from 'react-router-dom'

const MacroPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string>('select')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // サイズ設定
    const width = canvas.width = canvas.offsetWidth
    const height = canvas.height = canvas.offsetHeight

    // 背景
    ctx.fillStyle = '#121212'
    ctx.fillRect(0, 0, width, height)

    // グリッド（点線）
    ctx.save()
    ctx.strokeStyle = '#0070ff'
    ctx.globalAlpha = 0.5
    ctx.setLineDash([2, 4])
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.restore()

    // 図形の描画
    ctx.save()
    ctx.strokeStyle = '#0070ff'
    ctx.globalAlpha = 1
    ctx.lineWidth = 1
    const centerX = width / 2
    const centerY = height / 2
    const grid = 20
    // 小さい正方形: ±5と1/3グリッド
    const smallHalf = grid * (5 + 1/3)
    ctx.strokeRect(centerX - smallHalf, centerY - smallHalf, smallHalf * 2, smallHalf * 2)
    // 中くらい正方形: ±10と2/3グリッド
    const midHalf = grid * (10 + 2/3)
    ctx.strokeRect(centerX - midHalf, centerY - midHalf, midHalf * 2, midHalf * 2)
    ctx.restore()

    // 外側の長方形（白色）
    ctx.save()
    ctx.strokeStyle = '#fff'
    ctx.globalAlpha = 1
    ctx.lineWidth = 1
    const rectHalfX = grid * 17
    const rectHalfY = grid * 13
    ctx.strokeRect(centerX - rectHalfX, centerY - rectHalfY, rectHalfX * 2, rectHalfY * 2)
    ctx.restore()

    // 傾き1の直線（青色）
    ctx.save()
    ctx.strokeStyle = '#0070ff'
    ctx.globalAlpha = 1
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, centerY - centerX) // 左端
    ctx.lineTo(width, centerY + width - centerX) // 右端
    ctx.stroke()
    // 傾き-1の直線（青色）
    ctx.beginPath()
    ctx.moveTo(0, centerY + centerX) // 左端
    ctx.lineTo(width, centerY - width + centerX) // 右端
    ctx.stroke()
    ctx.restore()
  }, [])

  const tools = [
    { id: 'select', label: '選択' },
    { id: 'move', label: '移動' },
    { id: 'rotate', label: '回転' },
    { id: 'scale', label: '拡大縮小' },
    { id: 'delete', label: '削除' }
  ]

  const menuItems = [
    {
      title: 'ファイル',
      items: [
        { id: 'new', label: '新規作成' },
        { id: 'open', label: '開く' },
        { id: 'save', label: '保存' },
        { id: 'export', label: 'エクスポート' }
      ]
    },
    {
      title: '編集',
      items: [
        { id: 'undo', label: '元に戻す' },
        { id: 'redo', label: 'やり直し' },
        { id: 'copy', label: 'コピー' },
        { id: 'paste', label: '貼り付け' }
      ]
    },
    {
      title: '表示',
      items: [
        { id: 'grid', label: 'グリッド表示' },
        { id: 'snap', label: 'スナップ' },
        { id: 'zoom-in', label: '拡大' },
        { id: 'zoom-out', label: '縮小' }
      ]
    }
  ]

  return (
    <div className="main-page">
      <LogoHeader logoSrc={logoHorizon}>
        <button className="back-button" onClick={() => navigate('/projects')}>プロジェクト一覧に戻る</button>
      </LogoHeader>
      <div className="main-content">
        <div className="sidebar">
          {menuItems.map((section) => (
            <div key={section.title} className="menu-section">
              <div className="menu-title">{section.title}</div>
              {section.items.map((item) => (
                <div key={item.id} className="menu-item">
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="canvas-container">
          <div className="toolbar">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
              >
                {tool.label}
              </button>
            ))}
          </div>
          <div className="canvas">
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
        </div>
      </div>
      <footer className="footer">
        MASS Vision version 5.0 ©️S.K. / EXiTE programming.
      </footer>
    </div>
  )
}

export default MacroPage 