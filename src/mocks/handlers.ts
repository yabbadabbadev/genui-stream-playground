import { delay, http, HttpResponse } from 'msw'
import { genUiScript } from 'mocks/scripts/genUiScript'
import { markdownScript } from 'mocks/scripts/markdownScript'
import type { StreamedScript } from 'mocks/scripts/StreamedScript.types'

const encoder = new TextEncoder()

const toStreamedResponse = (script: StreamedScript, contentType: string) => {
  const stream = new ReadableStream({
    async start(controller) {
      for (const { content, delayMs } of script) {
        await delay(delayMs)
        controller.enqueue(encoder.encode(content))
      }
      controller.close()
    },
  })

  return new HttpResponse(stream, {
    headers: { 'Content-Type': contentType },
  })
}

const handlers = [
  http.post('/api/chat/markdown', () =>
    toStreamedResponse(markdownScript, 'text/markdown; charset=utf-8'),
  ),
  http.post('/api/chat/gen-ui', () =>
    toStreamedResponse(genUiScript, 'application/x-ndjson; charset=utf-8'),
  ),
]

export { handlers }
