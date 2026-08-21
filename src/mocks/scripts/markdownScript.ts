import type { StreamedScript } from 'mocks/scripts/StreamedScript.types'

const markdownScript: StreamedScript = [
  { content: '# Streaming playground\n\n', delayMs: 60 },
  { content: 'Rendering **GitHub Flavored Markdown** while it arrives. ', delayMs: 90 },
  { content: 'Current status:\n\n', delayMs: 90 },
  { content: '- [x] Open the stream\n', delayMs: 70 },
  { content: '- [ ] Close the code block below\n\n', delayMs: 70 },
  { content: 'The service that consumes this stream:\n\n', delayMs: 90 },
  { content: '```typescript\n', delayMs: 110 },
  { content: 'const readTextChunks = async (\n', delayMs: 110 },
  { content: '  body: ReadableStream<Uint8Array>,\n', delayMs: 110 },
  { content: '  onChunk: (chunk: string) => void,\n) => {\n', delayMs: 110 },
  { content: '  const reader = body.getReader()\n', delayMs: 110 },
  { content: '  const decoder = new TextDecoder()\n', delayMs: 110 },
  { content: '}\n', delayMs: 110 },
  { content: '```\n\n', delayMs: 110 },
  { content: 'And a table, because GFM:\n\n', delayMs: 90 },
  { content: '| Tab | Purpose |\n| --- | --- |\n', delayMs: 90 },
  { content: '| Markdown | Progressive markdown rendering |\n', delayMs: 90 },
  { content: '| GenUI | JSON payloads become components |\n\n', delayMs: 90 },
  { content: 'Stream finished ✅\n', delayMs: 60 },
]

const markdownFullText = markdownScript
  .map((streamedChunk) => streamedChunk.content)
  .join('')

export { markdownFullText, markdownScript }
