import type { AgentEvent } from 'app/agent/AgentEvent.types'
import type { StreamedScript } from 'mocks/scripts/StreamedScript.types'

const genUiEvents: AgentEvent[] = [
  { type: 'text', content: 'Checking the live weather for Valencia…' },
  {
    type: 'ui',
    component: 'WeatherCard',
    data: { city: 'Valencia', temp: 22, condition: 'sunny' },
  },
  { type: 'text', content: 'Perfect day for a walk. Anything else?' },
]

const serializeEvent = (event: AgentEvent) => `${JSON.stringify(event)}\n`

const [introLine, weatherCardLine, outroLine] = genUiEvents.map(serializeEvent)

const weatherCardSplitIndex = Math.floor(weatherCardLine.length / 2)

const genUiScript: StreamedScript = [
  { content: introLine, delayMs: 80 },
  { content: weatherCardLine.slice(0, weatherCardSplitIndex), delayMs: 120 },
  { content: weatherCardLine.slice(weatherCardSplitIndex), delayMs: 120 },
  { content: outroLine, delayMs: 80 },
]

export { genUiEvents, genUiScript }
