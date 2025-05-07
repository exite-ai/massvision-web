import React from 'react'

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="header">
        <h1>Massvision Web</h1>
      </header>
      <main className="main">
        <div className="sidebar">
          {/* サイドバーのコンテンツ */}
        </div>
        <div className="canvas">
          {/* キャンバスのコンテンツ */}
        </div>
      </main>
    </div>
  )
}

export default App 