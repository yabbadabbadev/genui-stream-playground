type StreamedChunk = {
  content: string
  delayMs: number
}

type StreamedScript = StreamedChunk[]

export type { StreamedChunk, StreamedScript }
