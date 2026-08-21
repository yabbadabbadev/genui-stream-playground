import { useRef, useState } from 'react'
import type { StreamTraceStep } from 'app/agent/StreamTrace.types'

type TraceEntry = {
  id: string
  elapsedMs: number
  step: StreamTraceStep
}

const useStreamTrace = () => {
  const [entries, setEntries] = useState<TraceEntry[]>([])
  const startedAtRef = useRef(0)

  const start = () => {
    startedAtRef.current = performance.now()
    setEntries([])
  }

  const record = (step: StreamTraceStep) => {
    const entry: TraceEntry = {
      id: crypto.randomUUID(),
      elapsedMs: Math.round(performance.now() - startedAtRef.current),
      step,
    }
    setEntries((currentEntries) => [...currentEntries, entry])
  }

  return { entries, start, record }
}

export { useStreamTrace }
export type { TraceEntry }
