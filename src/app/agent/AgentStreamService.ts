import type { AgentEvent } from 'app/agent/AgentEvent.types'
import type { StreamTraceListener } from 'app/agent/StreamTrace.types'

type StreamRequest = {
  prompt: string
  signal?: AbortSignal
}

type MarkdownStreamCallbacks = {
  onDelta: (delta: string) => void
  onComplete: () => void
  onError: (error: Error) => void
  onTrace?: StreamTraceListener
}

type GenUiStreamCallbacks = {
  onEvent: (event: AgentEvent) => void
  onComplete: () => void
  onError: (error: Error) => void
  onTrace?: StreamTraceListener
}

const noTrace: StreamTraceListener = () => undefined

const streamMarkdown = async (
  { prompt, signal }: StreamRequest,
  { onDelta, onComplete, onError, onTrace = noTrace }: MarkdownStreamCallbacks,
): Promise<void> => {
  try {
    const body = await postPrompt('/api/chat/markdown', prompt, onTrace, signal)
    await readTextChunks(body, onDelta, onTrace, signal)
    onTrace({ type: 'stream-closed' })
    onComplete()
  } catch (error) {
    notifyError(error, onError, onTrace)
  }
}

const streamGenUi = async (
  { prompt, signal }: StreamRequest,
  { onEvent, onComplete, onError, onTrace = noTrace }: GenUiStreamCallbacks,
): Promise<void> => {
  try {
    const body = await postPrompt('/api/chat/gen-ui', prompt, onTrace, signal)
    const decoder = createNdjsonDecoder(onEvent, onTrace)
    await readTextChunks(body, decoder.push, onTrace, signal)
    decoder.flush()
    onTrace({ type: 'stream-closed' })
    onComplete()
  } catch (error) {
    notifyError(error, onError, onTrace)
  }
}

const postPrompt = async (
  url: string,
  prompt: string,
  trace: StreamTraceListener,
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> => {
  trace({ type: 'request-sent', url })
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Stream request to ${url} failed with status ${response.status}`)
  }
  if (!response.body) {
    throw new Error(`Stream request to ${url} returned an empty body`)
  }

  return response.body
}

const readTextChunks = async (
  body: ReadableStream<Uint8Array>,
  onChunk: (chunk: string) => void,
  trace: StreamTraceListener,
  signal?: AbortSignal,
): Promise<void> => {
  const reader = body.getReader()
  const textDecoder = new TextDecoder()

  let result = await reader.read()
  while (!result.done) {
    trace({ type: 'chunk-received', bytes: result.value.byteLength })
    const text = textDecoder.decode(result.value, { stream: true })
    trace({ type: 'chunk-decoded', text })
    onChunk(text)
    if (signal?.aborted) {
      reader.cancel(signal.reason).catch(() => undefined)
      signal.throwIfAborted()
    }
    result = await reader.read()
  }

  const tail = textDecoder.decode()
  if (tail !== '') {
    trace({ type: 'chunk-decoded', text: tail })
    onChunk(tail)
  }
}

type NdjsonDecoder = {
  push: (chunk: string) => void
  flush: () => void
}

const createNdjsonDecoder = (
  onEvent: (event: AgentEvent) => void,
  trace: StreamTraceListener,
): NdjsonDecoder => {
  let buffer = ''

  const emitLine = (line: string) => {
    const event = parseAgentEvent(line)
    if (event) {
      trace({ type: 'event-parsed', event })
      onEvent(event)
    }
  }

  const push = (chunk: string) => {
    buffer += chunk
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    lines.filter(isNotBlank).forEach(emitLine)
    if (isNotBlank(buffer)) {
      trace({ type: 'line-buffered', pendingLine: buffer })
    }
  }

  const flush = () => {
    if (isNotBlank(buffer)) {
      emitLine(buffer)
    }
    buffer = ''
  }

  return { push, flush }
}

const isNotBlank = (line: string): boolean => line.trim() !== ''

const parseAgentEvent = (line: string): AgentEvent | null => {
  try {
    const candidate: unknown = JSON.parse(line)
    return isAgentEvent(candidate) ? candidate : null
  } catch {
    return null
  }
}

const isAgentEvent = (candidate: unknown): candidate is AgentEvent => {
  if (typeof candidate !== 'object' || candidate === null) {
    return false
  }

  const event = candidate as Record<string, unknown>
  if (event.type === 'text') {
    return typeof event.content === 'string'
  }
  if (event.type === 'ui') {
    return (
      typeof event.component === 'string' &&
      typeof event.data === 'object' &&
      event.data !== null
    )
  }

  return false
}

const notifyError = (
  error: unknown,
  onError: (error: Error) => void,
  trace: StreamTraceListener,
) => {
  if (isAbortError(error)) {
    return
  }
  const normalizedError = error instanceof Error ? error : new Error(String(error))
  trace({ type: 'stream-error', message: normalizedError.message })
  onError(normalizedError)
}

const isAbortError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'name' in error &&
  error.name === 'AbortError'

const AgentStreamService = {
  streamMarkdown,
  streamGenUi,
}

export { AgentStreamService }
export type { GenUiStreamCallbacks, MarkdownStreamCallbacks, StreamRequest }
