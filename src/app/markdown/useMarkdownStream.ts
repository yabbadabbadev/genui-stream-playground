import { useEffect, useRef, useState } from 'react'
import { AgentStreamService } from 'app/agent/AgentStreamService'
import type { MessageAuthor, StreamStatus } from 'app/shared/Streaming.types'
import { useStreamTrace } from 'app/shared/useStreamTrace'

type MarkdownMessage = {
  id: string
  author: MessageAuthor
  content: string
}

const appendDelta = (
  messages: MarkdownMessage[],
  messageId: string,
  delta: string,
): MarkdownMessage[] =>
  messages.map((message) =>
    message.id === messageId
      ? { ...message, content: message.content + delta }
      : message,
  )

const useMarkdownStream = () => {
  const [messages, setMessages] = useState<MarkdownMessage[]>([])
  const [status, setStatus] = useState<StreamStatus>('idle')
  const trace = useStreamTrace()
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortControllerRef.current?.abort(), [])

  const sendPrompt = (prompt: string) => {
    if (status === 'streaming') {
      return
    }

    const userMessage: MarkdownMessage = {
      id: crypto.randomUUID(),
      author: 'user',
      content: prompt,
    }
    const agentMessageId = crypto.randomUUID()
    const agentMessage: MarkdownMessage = {
      id: agentMessageId,
      author: 'agent',
      content: '',
    }
    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      agentMessage,
    ])
    setStatus('streaming')
    trace.start()

    abortControllerRef.current = new AbortController()
    AgentStreamService.streamMarkdown(
      { prompt, signal: abortControllerRef.current.signal },
      {
        onDelta: (delta) => {
          setMessages((currentMessages) =>
            appendDelta(currentMessages, agentMessageId, delta),
          )
          trace.record({
            type: 'render-applied',
            detail: `+${delta.length} caracteres en el mensaje`,
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

export { useMarkdownStream }
export type { MarkdownMessage }
