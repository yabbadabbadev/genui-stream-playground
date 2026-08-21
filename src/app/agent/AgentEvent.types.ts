type AgentTextEvent = {
  type: 'text'
  content: string
}

type AgentUiEvent = {
  type: 'ui'
  component: string
  data: Record<string, unknown>
}

type AgentEvent = AgentTextEvent | AgentUiEvent

export type { AgentEvent, AgentTextEvent, AgentUiEvent }
