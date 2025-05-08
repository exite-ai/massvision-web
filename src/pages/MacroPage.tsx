import React, { useState, useRef, useEffect } from 'react'
import '../styles/MainPage.css'
import LogoHeader from '../components/LogoHeader'
import logoHorizon from '../image/MASS Vision horizon.png'
import { useNavigate } from 'react-router-dom'
import { useCharacterManager } from '../hooks/useCharacterManager'
import { useRepositionManager } from '../hooks/useRepositionManager'

// キャラクター型とテスト用リスト
const CHARACTER_COLORS = [
  { name: '白', value: '#fff' },
  { name: '黄', value: '#ffe600' },
  { name: '赤', value: '#ff3b3b' },
  { name: 'シ', value: '#00e6ff' }, // シアン
  { name: 'マ', value: '#ff00c8' }, // マゼンタ
  { name: '緑', value: '#00ff6a' },
  { name: '肌', value: '#ffd1a4' },
  { name: '青', value: '#0066ff' },
  { name: '紫', value: '#9900ff' },
  { name: '橙', value: '#ff9900' }
]

interface CharacterState {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  angle: number;
}

const SUBGRID_UNIT = 20 / 12 // サブグリッド1単位のpx

const MacroPage: React.FC = () => {
  const [isInitialPositionMode, setIsInitialPositionMode] = useState(false)
  const [activeTool, setActiveTool] = useState<string>('select')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const navigate = useNavigate()
  const [hoveredCharIdx, setHoveredCharIdx] = useState<number | null>(null)
  const [magnifier, setMagnifier] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false })
  const magnifierTimeout = useRef<NodeJS.Timeout | null>(null)
  const [manualCoordinates, setManualCoordinates] = useState<{ x: string, y: string }>({ x: '', y: '' })
  const [isManualEditMode, setIsManualEditMode] = useState(false)
  const [manualAngle, setManualAngle] = useState<string>('0')
  const [editModalState, setEditModalState] = useState<{ name: string, x: string, y: string, angle: string } | null>(null)
  const [editCharIdx, setEditCharIdx] = useState<number | null>(null)
  const [editMode, setEditMode] = useState<'none' | 'ui' | 'manual'>('none')
  const [editTargetIdx, setEditTargetIdx] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ name: string, x: string, y: string, angle: string } | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const sidebarMinWidth = 220;
  const sidebarMaxWidth = 800;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [colorPickerIdx, setColorPickerIdx] = useState<number | null>(null);

  // プロジェクトIDの取得
  const pathParts = window.location.pathname.split('/')
  const projectId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2]

  // カスタムフックの使用
  const {
    characters,
    isLoading,
    error,
    initializeCharacters,
    updateCharacter,
    addCharacter,
    deleteCharacter
  } = useCharacterManager({ projectId });

  const {
    isRepositioning,
    targetCharacter,
    targetIndex,
    position,
    angle,
    startReposition,
    updatePosition,
    updateAngle,
    confirmPlacement,
    cancelPlacement
  } = useRepositionManager();

  // 初期化
  useEffect(() => {
    if (isInitialPositionMode) {
      initializeCharacters();
    }
  }, [isInitialPositionMode, initializeCharacters]);

  // Canvas描画
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
    // メイングリッド（20pxごと、中心基準）
    const centerX = width / 2
    const centerY = height / 2
    const grid = 20
    for (let n = -Math.ceil(centerX / 20); n <= Math.ceil((width - centerX) / 20); n++) {
      const x = centerX + n * 20
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let n = -Math.ceil(centerY / 20); n <= Math.ceil((height - centerY) / 20); n++) {
      const y = centerY + n * 20
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.restore()

    // サブグリッド（1マス=12分割, 薄い青色、中心基準）
    ctx.save()
    ctx.strokeStyle = 'rgba(0,112,255,0.15)'
    ctx.globalAlpha = 0.5
    ctx.setLineDash([1, 5])
    for (let n = -Math.ceil(centerX / (20/12)); n <= Math.ceil((width - centerX) / (20/12)); n++) {
      const x = centerX + n * (20/12)
      if (Math.abs((x - centerX) % 20) < 0.01) continue // メイングリッドと重複しないように
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let n = -Math.ceil(centerY / (20/12)); n <= Math.ceil((height - centerY) / (20/12)); n++) {
      const y = centerY + n * (20/12)
      if (Math.abs((y - centerY) % 20) < 0.01) continue
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

    // 配置済みキャラの描画
    if (ctx) {
      characters.forEach((char, i) => {
        ctx.save()
        ctx.beginPath()
        const centerX = width / 2
        const centerY = height / 2
        const px = centerX + char.x * SUBGRID_UNIT
        const py = centerY - char.y * SUBGRID_UNIT
        ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.fillStyle = char.color
        ctx.globalAlpha = 0.9
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#222'
        ctx.lineWidth = 2
        ctx.stroke()
        drawDirectionBar(ctx, px, py, char.angle, char.color)
        // 名前とIDの表示
        ctx.font = '12px sans-serif'
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText(`${char.name}(${char.id})`, px, py - 12)
        // --- ツールチップ描画 ---
        if (hoveredCharIdx === i) {
          ctx.save()
          ctx.font = '13px sans-serif'
          const lines = [
            `名前: ${char.name}`,
            `座標: (${char.x}, ${char.y})`,
            `角度: ${char.angle}°`
          ]
          const padding = 8
          let maxWidth = 0
          lines.forEach(line => {
            const w = ctx.measureText(line).width
            if (w > maxWidth) maxWidth = w
          })
          const boxWidth = maxWidth + padding * 2
          const boxHeight = lines.length * 16 + padding * 2
          ctx.fillStyle = '#222'
          ctx.globalAlpha = 0.85
          ctx.fillRect(px + 12, py - 24, boxWidth, boxHeight)
          ctx.globalAlpha = 1
          ctx.strokeStyle = '#fff'
          ctx.strokeRect(px + 12, py - 24, boxWidth, boxHeight)
          ctx.fillStyle = '#fff'
          lines.forEach((line, idx) => {
            ctx.fillText(line, px + 16, py - 8 + idx * 16)
          })
          ctx.restore()
        }
        ctx.restore()
      })
    }

    // 再設置中のキャラの描画
    if (isRepositioning && targetCharacter && position) {
      ctx.save()
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      const centerX = width / 2
      const centerY = height / 2
      const px = centerX + position.x * SUBGRID_UNIT
      const py = centerY - position.y * SUBGRID_UNIT
      ctx.arc(px, py, 5, 0, Math.PI * 2)
      ctx.fillStyle = targetCharacter.color
      ctx.fill()
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 2
      ctx.stroke()
      if (angle !== null) {
        drawDirectionBar(ctx, px, py, angle, targetCharacter.color)
        ctx.fillText(`${angle}°`, px + 10, py - 8)
      }
      ctx.globalAlpha = 1
      ctx.font = '12px sans-serif'
      ctx.fillStyle = '#fff'
      ctx.fillText(targetCharacter.name, px + 10, py + 4)
      ctx.restore()
    }

    // 虫眼鏡
    if (magnifier.show && position) {
      const magR = 40
      const magScale = 3
      ctx.save()
      ctx.beginPath()
      ctx.arc(magnifier.x, magnifier.y, magR, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(
        ctx.canvas,
        magnifier.x - magR / magScale,
        magnifier.y - magR / magScale,
        magR * 2 / magScale,
        magR * 2 / magScale,
        magnifier.x - magR,
        magnifier.y - magR,
        magR * 2,
        magR * 2
      )
      ctx.lineWidth = 2
      ctx.strokeStyle = '#fff'
      ctx.stroke()
      ctx.restore()
    }
  }, [characters, hoveredCharIdx, magnifier, isRepositioning, targetCharacter, position, angle]);

  // 棒付きキャラ描画
  function drawDirectionBar(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) {
    const r = 5
    const barLen = 8
    const barW = 2
    const barInset = 2
    const rad = (angle) * Math.PI / 180
    const barAngle = rad + Math.PI / 2
    const cx = x + Math.cos(rad) * (r - barInset)
    const cy = y + Math.sin(rad) * (r - barInset)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(barAngle)
    ctx.beginPath()
    ctx.rect(-barW/2, -barLen, barW, barLen)
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
  }

  // サブグリッド整数スナップ
  function snapToSubgrid(x: number, y: number, canvas: HTMLCanvasElement) {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const sx = Math.round((x - centerX) / SUBGRID_UNIT)
    const sy = Math.round((centerY - y) / SUBGRID_UNIT)
    return {
      x: centerX + sx * SUBGRID_UNIT,
      y: centerY - sy * SUBGRID_UNIT,
      sx,
      sy
    }
  }

  // Canvasクリック
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const canvas = canvasRef.current
    if (!canvas) return

    // キャラクリックでツールチップ表示
    let found = null
    for (let i = 0; i < characters.length; i++) {
      const c = characters[i]
      const px = canvas.width / 2 + c.x * SUBGRID_UNIT
      const py = canvas.height / 2 - c.y * SUBGRID_UNIT
      const dist = Math.hypot(x - px, y - py)
      if (dist <= 10) { found = i; break }
    }
    setHoveredCharIdx(found)

    if (isRepositioning && targetCharacter) {
      const snapped = snapToSubgrid(x, y, canvas)
      updatePosition(snapped.sx, snapped.sy)
      setManualCoordinates({ x: snapped.sx.toString(), y: snapped.sy.toString() })
    }
  }

  // マウス移動
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const canvas = canvasRef.current
    if (!canvas) return

    if (isRepositioning && targetCharacter && !isManualEditMode) {
      const snapped = snapToSubgrid(mx, my, canvas)
      updatePosition(snapped.sx, snapped.sy)
      setManualCoordinates({ x: snapped.sx.toString(), y: snapped.sy.toString() })
    }

    // 虫眼鏡が表示中なら追従
    if (magnifier.show) setMagnifier(m => ({ ...m, x: mx, y: my }))
  }

  // 虫眼鏡関連
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isRepositioning && targetCharacter) {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      magnifierTimeout.current = setTimeout(() => {
        setMagnifier({ x: mx, y: my, show: true })
      }, 350)
    }
  }

  const handleCanvasMouseUp = () => {
    if (magnifierTimeout.current) clearTimeout(magnifierTimeout.current)
    setMagnifier(m => ({ ...m, show: false }))
  }

  const handleCanvasMouseLeave = () => {
    setHoveredCharIdx(null)
    if (magnifierTimeout.current) clearTimeout(magnifierTimeout.current)
    setMagnifier(m => ({ ...m, show: false }))
  }

  // 右クリックメニュー
  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const canvas = canvasRef.current
    if (!canvas) return

    if (isRepositioning && targetCharacter && position) {
      const snapped = snapToSubgrid(position.x, position.y, canvas)
      setManualCoordinates({ x: snapped.sx.toString(), y: snapped.sy.toString() })
      setManualAngle(angle !== null ? angle.toString() : manualAngle)
      setIsManualEditMode(mode => !mode)
      return
    }

    for (let i = 0; i < characters.length; i++) {
      const c = characters[i]
      const dist = Math.hypot(mx - (canvas.width/2 + c.x * SUBGRID_UNIT), my - (canvas.height/2 - c.y * SUBGRID_UNIT))
      if (dist <= 10) {
        setEditTargetIdx(i)
        setEditValues({
          name: c.name,
          x: c.x.toString(),
          y: c.y.toString(),
          angle: c.angle.toString()
        })
        setEditMode(editMode === 'manual' ? 'ui' : 'manual')
        break
      }
    }
  }

  // 手動座標入力
  const handleManualCoordinateChange = (axis: 'x' | 'y', value: string) => {
    if (!/^[-]?\d+$/.test(value)) return
    setManualCoordinates(prev => ({ ...prev, [axis]: value }))
    if (isRepositioning && targetCharacter) {
      updatePosition(
        axis === 'x' ? Number(value) : position?.x ?? 0,
        axis === 'y' ? Number(value) : position?.y ?? 0
      )
    }
  }

  // 手動角度入力
  const handleManualAngleChange = (value: string) => {
    if (!/^\d+$/.test(value)) return
    let deg = Math.max(0, Math.min(359, Number(value)))
    setManualAngle(deg.toString())
    if (isRepositioning && targetCharacter) {
      updateAngle(deg)
    }
  }

  // 再設置開始
  const handleRepositionCharacter = (char: CharacterState, idx: number) => {
    startReposition(char, idx);
    setIsManualEditMode(true);
  };

  // 手動編集の確定
  const handleManualEditConfirm = async () => {
    if (isRepositioning && targetCharacter && position && angle !== null) {
      const result = confirmPlacement();
      if (result) {
        if (result.isNewCharacter) {
          await addCharacter(result);
        } else {
          await updateCharacter(targetIndex!, {
            x: result.x,
            y: result.y,
            angle: result.angle
          });
        }
        setIsManualEditMode(false);
      }
    }
  };

  // ESCキーでキャンセル
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRepositioning) {
        cancelPlacement();
        setIsManualEditMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRepositioning, cancelPlacement]);

  // サイドバーのリサイズ機能
  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleSidebarMouseMove);
    window.addEventListener('mouseup', handleSidebarMouseUp);
  };

  const handleSidebarMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left || 0;
    const newWidth = Math.max(sidebarMinWidth, Math.min(sidebarMaxWidth, e.clientX - sidebarLeft));
    setSidebarWidth(newWidth);
  };

  const handleSidebarMouseUp = () => {
    isResizing.current = false;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleSidebarMouseMove);
    window.removeEventListener('mouseup', handleSidebarMouseUp);
  };

  // キャラクター削除
  const handleDeleteCharacter = async (idx: number) => {
    await deleteCharacter(idx);
  };

  // キャラクター情報の更新
  const handleCharacterFieldChange = async (idx: number, field: 'name' | 'x' | 'y' | 'angle', value: string) => {
    await updateCharacter(idx, {
      [field]: field === 'name' ? value : Number(value)
    });
  };

  // キャラクターの色変更
  const handleCharacterColorChange = async (idx: number, colorName: string) => {
    const colorValue = CHARACTER_COLORS.find(col => col.name === colorName)?.value || '#fff';
    await updateCharacter(idx, { color: colorValue, name: colorName });
    setColorPickerIdx(null);
  };

  // 新規キャラクター追加
  const handleAddCharacter = async (color: { name: string; value: string }) => {
    const newCharacter = {
      id: `char_${Date.now()}`,
      name: color.name,
      color: color.value,
      x: 0,
      y: 0,
      angle: 0
    };
    startReposition(newCharacter, 0);
    setIsManualEditMode(true);
  };

  // エクスポート機能
  const handleExport = () => {
    const data = {
      characters: characters.map(c => ({
        id: c.id,
        name: c.name,
        color: c.color,
        x: c.x,
        y: c.y,
        angle: c.angle
      })),
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'massvision-scene.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="main-page">
      <LogoHeader logoSrc={logoHorizon}>
        <button className="back-button" onClick={() => navigate('/projects')}>プロジェクト一覧に戻る</button>
      </LogoHeader>
      <div className="main-content">
        <div
          className="sidebar"
          ref={sidebarRef}
          style={{ width: sidebarWidth, minWidth: sidebarMinWidth, maxWidth: sidebarMaxWidth, position: 'relative', userSelect: isResizing.current ? 'none' : 'auto' }}
        >
          <div
            style={{ position: 'absolute', top: 0, right: 0, width: 8, height: '100%', cursor: 'col-resize', zIndex: 10 }}
            onMouseDown={handleSidebarMouseDown}
          />
          <div className="menu-section">
            <button 
              className={`menu-button ${isInitialPositionMode ? 'active' : ''}`}
              onClick={() => setIsInitialPositionMode(true)}
            >
              初期位置の設定
            </button>
            {/* キャラリストテーブル */}
            {isInitialPositionMode && (
              <div style={{ marginTop: 12 }}>
                <div style={{ 
                  background: '#333', 
                  padding: '8px 12px', 
                  borderBottom: '1px solid #444',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>キャラクターリスト</span>
                  <span style={{ color: '#aaa', fontSize: '0.9em' }}>{characters.length}人配置済み</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    minWidth: 800, 
                    color: '#fff', 
                    background: '#222', 
                    borderCollapse: 'collapse', 
                    fontSize: '0.95em',
                    width: '100%'
                  }}>
                    <thead>
                      <tr style={{ background: '#333' }}>
                        <th style={{ textAlign: 'center', width: '50px' }}>カラー</th>
                        <th style={{ textAlign: 'center', width: '40px' }}>ID</th>
                        <th style={{ textAlign: 'center', width: '160px' }}>名前</th>
                        <th style={{ textAlign: 'center', width: '90px' }}>X</th>
                        <th style={{ textAlign: 'center', width: '90px' }}>Y</th>
                        <th style={{ textAlign: 'center', width: '90px' }}>角度</th>
                        <th style={{ textAlign: 'center', width: '100px' }}></th>
                        <th style={{ textAlign: 'center', width: '100px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {characters.map((char, idx) => (
                        <tr key={char.id} style={{ borderBottom: '1px solid #444', textAlign: 'center' }}>
                          <td style={{ position: 'relative', textAlign: 'center', padding: '8px 0' }}>
                            <div
                              style={{ width: 18, height: 18, borderRadius: '50%', background: char.color, border: '2px solid #444', cursor: 'pointer', margin: '0 auto' }}
                              onClick={() => setColorPickerIdx(idx)}
                            />
                            {colorPickerIdx === idx && (
                              <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', background: '#222', border: '1px solid #444', borderRadius: 6, padding: 6, zIndex: 100 }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  {CHARACTER_COLORS.map((color) => (
                                    <div
                                      key={color.value + color.name}
                                      style={{ width: 18, height: 18, borderRadius: '50%', background: color.value, border: '2px solid #444', cursor: 'pointer', marginBottom: 2 }}
                                      onClick={() => handleCharacterColorChange(idx, color.name)}
                                    />
                                  ))}
                                </div>
                                <button style={{ marginTop: 4, fontSize: 10, background: '#444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }} onClick={() => setColorPickerIdx(null)}>閉じる</button>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '8px 0' }}>{char.id}</td>
                          <td style={{ padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
                            <input
                              type="text"
                              id={`char-name-${char.id}`}
                              lang="ja"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              value={char.name}
                              onChange={e => handleCharacterFieldChange(idx, 'name', e.target.value)}
                              style={{ width: 120, background: '#333', color: '#fff', border: '1px solid #666', borderRadius: 4, padding: '4px 8px', textAlign: 'left' }}
                            />
                          </td>
                          <td style={{ padding: '8px 0' }}>
                            <input
                              type="number"
                              id={`char-x-${char.id}`}
                              value={char.x}
                              onChange={e => handleCharacterFieldChange(idx, 'x', e.target.value)}
                              style={{ width: 65, background: '#333', color: '#fff', border: '1px solid #666', borderRadius: 4, padding: '4px 8px', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ padding: '8px 0' }}>
                            <input
                              type="number"
                              id={`char-y-${char.id}`}
                              value={char.y}
                              onChange={e => handleCharacterFieldChange(idx, 'y', e.target.value)}
                              style={{ width: 65, background: '#333', color: '#fff', border: '1px solid #666', borderRadius: 4, padding: '4px 8px', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ padding: '8px 0' }}>
                            <input
                              type="number"
                              id={`char-angle-${char.id}`}
                              value={char.angle}
                              onChange={e => handleCharacterFieldChange(idx, 'angle', e.target.value)}
                              style={{ width: 65, background: '#333', color: '#fff', border: '1px solid #666', borderRadius: 4, padding: '4px 8px', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ padding: '8px 0' }}>
                            <button style={{ background: '#0070ff', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }} onClick={() => handleRepositionCharacter(char, idx)}>再設置</button>
                          </td>
                          <td style={{ padding: '8px 0' }}>
                            <button style={{ background: '#c00', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }} onClick={() => handleDeleteCharacter(idx)}>削除</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* 新規キャラ追加カラーパレット */}
            {isInitialPositionMode && (
              <div style={{ 
                margin: '16px 0', 
                background: '#333',
                padding: '12px',
                borderRadius: '4px'
              }}>
                <div style={{ 
                  marginBottom: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>新規キャラクター追加</span>
                  <span style={{ color: '#aaa', fontSize: '0.9em' }}>カラーをクリックして配置</span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {CHARACTER_COLORS.map((color) => (
                    <div 
                      key={color.value + color.name} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#444'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => handleAddCharacter(color)}
                    >
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        background: color.value, 
                        border: '2px solid #444',
                        marginBottom: 4
                      }} />
                      <span style={{ color: '#fff', fontSize: 12 }}>{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button className="menu-button" onClick={() => setIsInitialPositionMode(false)}>
              シーン・マクロの編集
            </button>
            <button className="menu-button" onClick={handleExport}>
              エクスポート
            </button>
            <button className="menu-button" disabled>
              アニメーション
            </button>
          </div>
        </div>
        <div className="canvas-container">
          <div className="canvas">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', display: 'block' }}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseDown={handleCanvasMouseDown}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseLeave}
              onContextMenu={handleCanvasContextMenu}
            />
          </div>
          {/* --- 入力UIをCanvas下部中央に配置（右クリック時のみ） --- */}
          {isInitialPositionMode && isManualEditMode && (
            <div style={{
              position: 'absolute',
              left: '50%',
              bottom: '16px',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.85)',
              padding: '16px 24px',
              borderRadius: '8px',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '260px',
              boxShadow: '0 2px 8px #0008'
            }}>
              {isRepositioning && targetCharacter && (
                <>
                  <div style={{ color: '#fff', marginBottom: '10px' }}>座標を入力してください</div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <label style={{ color: '#fff' }}>X: <input type="number" value={manualCoordinates.x} onChange={e => handleManualCoordinateChange('x', e.target.value)} style={{ width: 60, background: '#333', color: '#fff', border: '1px solid #666' }} /></label>
                    <label style={{ color: '#fff' }}>Y: <input type="number" value={manualCoordinates.y} onChange={e => handleManualCoordinateChange('y', e.target.value)} style={{ width: 60, background: '#333', color: '#fff', border: '1px solid #666' }} /></label>
                  </div>
                  <button onClick={handleManualEditConfirm} style={{ background: '#0070ff', color: '#fff', border: 'none', padding: '4px 16px', borderRadius: '4px', cursor: 'pointer' }}>確定</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <footer className="footer">
        MASS Vision version 5.0 ©️S.K. / EXiTE programming.
      </footer>
    </div>
  )
}

export default MacroPage 