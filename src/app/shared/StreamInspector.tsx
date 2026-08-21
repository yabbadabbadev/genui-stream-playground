import type { StreamTraceStep } from 'app/agent/StreamTrace.types'
import type { TraceEntry } from 'app/shared/useStreamTrace'
import './StreamInspector.css'

type StreamPhase = 'request' | 'read' | 'decode' | 'parse' | 'render'

const PHASE_LABELS: Record<StreamPhase, string> = {
  request: 'Petición',
  read: 'Lectura',
  decode: 'Decodificación',
  parse: 'Parseo',
  render: 'Render',
}

type StepInfo = {
  label: string
  phase: StreamPhase | null
  description: string
  source: string
}

const STEP_INFO: Record<StreamTraceStep['type'], StepInfo> = {
  'request-sent': {
    label: 'Petición enviada',
    phase: 'request',
    description:
      'fetch hace POST con el prompt y la respuesta expone response.body: un ReadableStream<Uint8Array> que llega por trozos.',
    source: 'postPrompt · AgentStreamService.ts',
  },
  'chunk-received': {
    label: 'Chunk recibido',
    phase: 'read',
    description:
      'reader.read() resuelve con el siguiente trozo de bytes crudos (Uint8Array). El bucle repite hasta que done sea true.',
    source: 'readTextChunks · AgentStreamService.ts',
  },
  'chunk-decoded': {
    label: 'Chunk decodificado',
    phase: 'decode',
    description:
      'TextDecoder con { stream: true } convierte los bytes en texto sin romper caracteres multibyte partidos entre chunks.',
    source: 'readTextChunks · AgentStreamService.ts',
  },
  'line-buffered': {
    label: 'Línea incompleta en búfer',
    phase: 'parse',
    description:
      'El decoder NDJSON corta por saltos de línea; esta línea aún no tiene \\n, así que espera en el búfer al siguiente chunk.',
    source: 'createNdjsonDecoder · AgentStreamService.ts',
  },
  'event-parsed': {
    label: 'Evento parseado',
    phase: 'parse',
    description:
      'La línea completa pasa por JSON.parse y el type guard isAgentEvent valida su shape antes de emitirla a la UI.',
    source: 'createNdjsonDecoder · AgentStreamService.ts',
  },
  'render-applied': {
    label: 'Render actualizado',
    phase: 'render',
    description:
      'El hook actualiza el estado React con lo recibido y la vista re-renderiza el resultado acumulado.',
    source: 'useMarkdownStream / useGenUiStream',
  },
  'stream-closed': {
    label: 'Stream cerrado',
    phase: null,
    description:
      'reader.read() devolvió done: true; se hace flush del decoder y se notifica onComplete.',
    source: 'AgentStreamService.ts',
  },
  'stream-error': {
    label: 'Error en el stream',
    phase: null,
    description:
      'La petición o la lectura fallaron; se normaliza el error y se notifica onError (los abortos del usuario no cuentan como error).',
    source: 'notifyError · AgentStreamService.ts',
  },
}

const PAYLOAD_MAX_LENGTH = 48

const truncate = (text: string): string => {
  const flatText = text.replaceAll('\n', '↵')
  if (flatText.length <= PAYLOAD_MAX_LENGTH) {
    return flatText
  }
  return `${flatText.slice(0, PAYLOAD_MAX_LENGTH)}…`
}

const stepPayload = (step: StreamTraceStep): string | null => {
  if (step.type === 'request-sent') {
    return step.url
  }
  if (step.type === 'chunk-received') {
    return `${step.bytes} bytes`
  }
  if (step.type === 'chunk-decoded') {
    return truncate(step.text)
  }
  if (step.type === 'line-buffered') {
    return truncate(step.pendingLine)
  }
  if (step.type === 'event-parsed') {
    return truncate(JSON.stringify(step.event))
  }
  if (step.type === 'render-applied') {
    return step.detail
  }
  if (step.type === 'stream-error') {
    return step.message
  }
  return null
}

type StreamInspectorProps = {
  phases: StreamPhase[]
  entries: TraceEntry[]
}

const StreamInspector = ({ phases, entries }: StreamInspectorProps) => {
  const lastEntry = entries.at(-1)
  const isFinished =
    lastEntry?.step.type === 'stream-closed' ||
    lastEntry?.step.type === 'stream-error'
  const lastPhasedEntry = entries.findLast(
    (entry) => STEP_INFO[entry.step.type].phase !== null,
  )
  const activePhase =
    isFinished || !lastPhasedEntry
      ? null
      : STEP_INFO[lastPhasedEntry.step.type].phase
  const reachedPhases = new Set(
    entries.map((entry) => STEP_INFO[entry.step.type].phase),
  )

  return (
    <aside className="stream-inspector" aria-label="Inspector del stream">
      <details className="stream-inspector__panel" open>
        <summary className="stream-inspector__title">Inspector del stream</summary>
        <ol className="stream-inspector__phases" aria-label="Fases del pipeline">
          {phases.map((phase) => (
            <li
              key={phase}
              aria-current={phase === activePhase ? 'step' : undefined}
              className={
                reachedPhases.has(phase)
                  ? 'stream-inspector__phase stream-inspector__phase--reached'
                  : 'stream-inspector__phase'
              }
            >
              {PHASE_LABELS[phase]}
            </li>
          ))}
        </ol>
        {entries.length === 0 && (
          <p className="stream-inspector__empty">
            Envía un prompt para ver el pipeline en acción.
          </p>
        )}
        <ol className="stream-inspector__timeline">
          {entries.map((entry) => (
            <StreamInspectorEntry key={entry.id} entry={entry} />
          ))}
        </ol>
      </details>
    </aside>
  )
}

type StreamInspectorEntryProps = {
  entry: TraceEntry
}

const StreamInspectorEntry = ({ entry }: StreamInspectorEntryProps) => {
  const info = STEP_INFO[entry.step.type]
  const payload = stepPayload(entry.step)

  return (
    <li
      className={`stream-inspector__entry stream-inspector__entry--${info.phase ?? 'lifecycle'}`}
    >
      <details className="stream-inspector__entry-details">
        <summary className="stream-inspector__entry-summary">
          <span className="stream-inspector__entry-time">{entry.elapsedMs} ms</span>
          <span className="stream-inspector__entry-label">{info.label}</span>
          {payload && (
            <code className="stream-inspector__entry-payload">{payload}</code>
          )}
        </summary>
        <p className="stream-inspector__entry-description">{info.description}</p>
        <p className="stream-inspector__entry-source">{info.source}</p>
      </details>
    </li>
  )
}

export { StreamInspector }
export type { StreamPhase }
