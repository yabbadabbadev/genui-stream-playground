import type { AgentEvent } from 'app/agent/AgentEvent.types'

type StreamTraceStep =
  | { type: 'request-sent'; url: string }
  | { type: 'chunk-received'; bytes: number }
  | { type: 'chunk-decoded'; text: string }
  | { type: 'line-buffered'; pendingLine: string }
  | { type: 'event-parsed'; event: AgentEvent }
  | { type: 'render-applied'; detail: string }
  | { type: 'stream-closed' }
  | { type: 'stream-error'; message: string }

type StreamTraceListener = (step: StreamTraceStep) => void

export type { StreamTraceListener, StreamTraceStep }
