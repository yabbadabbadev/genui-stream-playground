import { useEffect, useRef, useState } from 'react'
import type { AgentEvent } from 'app/agent/AgentEvent.types'
import { AgentStreamService } from 'app/agent/AgentStreamService'
import type { MessageAuthor, StreamStatus } from 'app/shared/Streaming.types'
import { useStreamTrace } from 'app/shared/useStreamTrace'

type GenUiMessage = {
  id: string
  author: MessageAuthor
  event: AgentEvent
}

const useGenUiStream = () => {
  const [messages, setMessages] = useState<GenUiMessage[]>([])
  const [status, setStatus] = useState<StreamStatus>('idle')
  const trace = useStreamTrace()
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortControllerRef.current?.abort(), [])

  const appendMessage = (author: MessageAuthor, event: AgentEvent) => {
    const message: GenUiMessage = { id: crypto.randomUUID(), author, event }
    setMessages((currentMessages) => [...currentMessages, message])
  }

  const sendPrompt = (prompt: string) => {
    if (status === 'streaming') {
      return
    }

    appendMessage('user', { type: 'text', content: prompt })
    setStatus('streaming')
    trace.start()

    abortControllerRef.current = new AbortController()
    AgentStreamService.streamGenUi(
      { prompt, signal: abortControllerRef.current.signal },
      {
        onEvent: (event) => {
          appendMessage('agent', event)
          trace.record({
            type: 'render-applied',
            detail:
              event.type === 'ui'
                ? `Componente ${event.component} añadido al chat`
                : 'Texto añadido al chat',
          })
        },
        onComplete: () => setStatus('idle'),
        onError: () => setStatus('error'),
        onTrace: trace.record,
      },
    )
  }

  return { messages, status, traceEntries: trace.entries, sendPrompt }
}

export { useGenUiStream }
export type { GenUiMessage }
