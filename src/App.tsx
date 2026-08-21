import { useState } from 'react'
import { GenUiStreamView } from 'app/genUi/GenUiStreamView'
import { MarkdownStreamView } from 'app/markdown/MarkdownStreamView'
import './App.css'

const TABS = [
  { id: 'markdown', label: 'Markdown Stream' },
  { id: 'gen-ui', label: 'GenUI Stream' },
] as const

type PlaygroundTabId = (typeof TABS)[number]['id']

const App = () => {
  const [activeTab, setActiveTab] = useState<PlaygroundTabId>('markdown')

  return (
    <div className="playground">
      <header className="playground__header">
        <h1 className="playground__title">LLM Streaming Playground</h1>
        <nav className="playground__tabs" role="tablist" aria-label="Modos de streaming">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={
                activeTab === tab.id
                  ? 'playground__tab playground__tab--active'
                  : 'playground__tab'
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="playground__content">
        {activeTab === 'markdown' && <MarkdownStreamView />}
        {activeTab === 'gen-ui' && <GenUiStreamView />}
      </main>
    </div>
  )
}

export { App }
