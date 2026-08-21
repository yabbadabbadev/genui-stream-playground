import { HttpResponse } from 'msw'

type ManualStream = {
  toResponse: () => HttpResponse<ReadableStream<Uint8Array>>
  emit: (content: string) => void
  close: () => void
}

const createManualStream = (): ManualStream => {
  let controller!: ReadableStreamDefaultController<Uint8Array>
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(streamController) {
      controller = streamController
    },
  })

  return {
    toResponse: () =>
      new HttpResponse(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }),
    emit: (content) => controller.enqueue(encoder.encode(content)),
    close: () => controller.close(),
  }
}

export { createManualStream }
