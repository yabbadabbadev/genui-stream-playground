import { MarkdownRenderer } from 'app/shared/MarkdownRenderer'
import { PromptForm } from 'app/shared/PromptForm'
import { StreamInspector } from 'app/shared/StreamInspector'
import type { StreamPhase } from 'app/shared/StreamInspector'
import { useMarkdownStream } from 'app/markdown/useMarkdownStream'
import type { MarkdownMessage } from 'app/markdown/useMarkdownStream'
import './MarkdownStreamView.css'

const MARKDOWN_PHASES: StreamPhase[] = ['request', 'read', 'decode', 'render']

const MarkdownStreamView = () => {
  const { messages, status, traceEntries, sendPrompt } = useMarkdownStream()

  return (
    <section className="markdown-stream" aria-label="Markdown Stream">
      <div className="markdown-stream__chat">
        <ul className="markdown-stream__messages" aria-label="Conversación">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`markdown-stream__message markdown-stream__message--${message.author}`}
            >
              <MarkdownStreamMessage message={message} />
            </li>
          ))}
        </ul>
        {status === 'streaming' && (
          <span className="markdown-stream__caret" aria-hidden="true">
            ▍
          </span>
        )}
        {status === 'error' && (
          <p className="markdown-stream__error" role="alert">
            Algo ha fallado al recibir la respuesta.
          </p>
        )}
        <PromptForm
          placeholder="Pide un texto en markdown…"
          isStreaming={status === 'streaming'}
          onSubmit={sendPrompt}
        />
      </div>
      <StreamInspector phases={MARKDOWN_PHASES} entries={traceEntries} />
    </section>
  )
}

type MarkdownStreamMessageProps = {
  message: MarkdownMessage
}

const MarkdownStreamMessage = ({ message }: MarkdownStreamMessageProps) => {
  if (message.author === 'user') {
    return <p className="markdown-stream__prompt">{message.content}</p>
  }
  return <MarkdownRenderer content={message.content} />
}

export { MarkdownStreamView }
