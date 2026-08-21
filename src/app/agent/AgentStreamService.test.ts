import { http, HttpResponse } from 'msw'
import type { AgentEvent } from 'app/agent/AgentEvent.types'
import { AgentStreamService } from 'app/agent/AgentStreamService'
import type { StreamTraceStep } from 'app/agent/StreamTrace.types'
import { server } from 'mocks/server'
import { genUiEvents } from 'mocks/scripts/genUiScript'
import { markdownFullText } from 'mocks/scripts/markdownScript'

describe('AgentStreamService', () => {
  it('should deliver markdown deltas progressively until the full document arrives', async () => {
    const deltas: string[] = []
    const onComplete = vi.fn()
    const onError = vi.fn()

    await AgentStreamService.streamMarkdown(
      { prompt: 'stream some markdown' },
      {
        onDelta: (delta) => {
          deltas.push(delta)
        },
        onComplete,
        onError,
      },
    )

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledOnce()
    expect(deltas.length).toBeGreaterThan(1)
    expect(deltas.join('')).toBe(markdownFullText)
  })

  it('should emit parsed agent events even when a JSON payload is split across chunks', async () => {
    const events: AgentEvent[] = []
    const onComplete = vi.fn()
    const onError = vi.fn()

    await AgentStreamService.streamGenUi(
      { prompt: 'what is the weather like?' },
      {
        onEvent: (event) => {
          events.push(event)
        },
        onComplete,
        onError,
      },
    )

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledOnce()
    expect(events).toEqual(genUiEvents)
  })

  it('should notify an error when the endpoint fails', async () => {
    server.use(
      http.post('/api/chat/markdown', () => new HttpResponse(null, { status: 500 })),
    )
    const onDelta = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    await AgentStreamService.streamMarkdown(
      { prompt: 'stream some markdown' },
      { onDelta, onComplete, onError },
    )

    expect(onDelta).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0][0].message).toContain('500')
  })

  it('should trace every pipeline step while streaming markdown', async () => {
    const steps: StreamTraceStep[] = []

    await AgentStreamService.streamMarkdown(
      { prompt: 'stream some markdown' },
      {
        onDelta: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn(),
        onTrace: (step) => {
          steps.push(step)
        },
      },
    )

    expect(steps[0]).toEqual({ type: 'request-sent', url: '/api/chat/markdown' })
    const receivedBytes = steps.filter((step) => step.type === 'chunk-received')
    expect(receivedBytes.length).toBeGreaterThan(1)
    receivedBytes.forEach((step) => expect(step.bytes).toBeGreaterThan(0))
    const decodedTexts = steps
      .filter((step) => step.type === 'chunk-decoded')
      .map((step) => step.text)
    expect(decodedTexts.join('')).toBe(markdownFullText)
    expect(steps.at(-1)).toEqual({ type: 'stream-closed' })
  })

  it('should trace the buffered line and the parsed events on the ndjson stream', async () => {
    const steps: StreamTraceStep[] = []

    await AgentStreamService.streamGenUi(
      { prompt: 'what is the weather like?' },
      {
        onEvent: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn(),
        onTrace: (step) => {
          steps.push(step)
        },
      },
    )

    const bufferedLines = steps.filter((step) => step.type === 'line-buffered')
    expect(bufferedLines).toHaveLength(1)
    expect(bufferedLines[0].pendingLine.startsWith('{"type":"ui"')).toBe(true)
    const parsedEvents = steps
      .filter((step) => step.type === 'event-parsed')
      .map((step) => step.event)
    expect(parsedEvents).toEqual(genUiEvents)
  })

  it('should trace the failure when the endpoint fails', async () => {
    server.use(
      http.post('/api/chat/markdown', () => new HttpResponse(null, { status: 500 })),
    )
    const steps: StreamTraceStep[] = []

    await AgentStreamService.streamMarkdown(
      { prompt: 'stream some markdown' },
      {
        onDelta: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn(),
        onTrace: (step) => {
          steps.push(step)
        },
      },
    )

    expect(steps.at(-1)).toEqual({
      type: 'stream-error',
      message: 'Stream request to /api/chat/markdown failed with status 500',
    })
  })

  it('should stay silent when the consumer aborts the stream', async () => {
    const abortController = new AbortController()
    const onComplete = vi.fn()
    const onError = vi.fn()

    const streaming = AgentStreamService.streamMarkdown(
      { prompt: 'stream some markdown', signal: abortController.signal },
      {
        onDelta: () => abortController.abort(),
        onComplete,
        onError,
      },
    )
    await streaming

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
