import type { AgentEvent } from 'app/agent/AgentEvent.types'
import { GenUiComponentSlot } from 'app/genUi/GenUiComponentSlot'
import { useGenUiStream } from 'app/genUi/useGenUiStream'
import { PromptForm } from 'app/shared/PromptForm'
import { StreamInspector } from 'app/shared/StreamInspector'
import type { StreamPhase } from 'app/shared/StreamInspector'
import './GenUiStreamView.css'

const GEN_UI_PHASES: StreamPhase[] = ['request', 'read', 'decode', 'parse', 'render']

const GenUiStreamView = () => {
  const { messages, status, traceEntries, sendPrompt } = useGenUiStream()

  return (
    <section className="gen-ui-stream" aria-label="GenUI Stream">
      <div className="gen-ui-stream__chat">
        <ul className="gen-ui-stream__messages" aria-label="Conversación">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`gen-ui-stream__message gen-ui-stream__message--${message.author}`}
            >
              <GenUiEventContent event={message.event} />
            </li>
          ))}
        </ul>
        {status === 'error' && (
          <p className="gen-ui-stream__error" role="alert">
            Algo ha fallado al recibir la respuesta.
          </p>
        )}
        <PromptForm
          placeholder="Pregunta por el tiempo…"
          isStreaming={status === 'streaming'}
          onSubmit={sendPrompt}
        />
      </div>
      <StreamInspector phases={GEN_UI_PHASES} entries={traceEntries} />
    </section>
  )
}

type GenUiEventContentProps = {
  event: AgentEvent
}

const GenUiEventContent = ({ event }: GenUiEventContentProps) => {
  if (event.type === 'ui') {
    return <GenUiComponentSlot component={event.component} data={event.data} />
  }
  return <p className="gen-ui-stream__text">{event.content}</p>
}

export { GenUiStreamView }
