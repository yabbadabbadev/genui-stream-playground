import { useState } from 'react'
import type { FormEvent } from 'react'
import './PromptForm.css'

type PromptFormProps = {
  placeholder: string
  isStreaming: boolean
  onSubmit: (prompt: string) => void
}

const PromptForm = ({ placeholder, isStreaming, onSubmit }: PromptFormProps) => {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt === '' || isStreaming) {
      return
    }
    onSubmit(trimmedPrompt)
    setPrompt('')
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <input
        className="prompt-form__input"
        aria-label="Prompt"
        placeholder={placeholder}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <button
        className="prompt-form__submit"
        type="submit"
        disabled={isStreaming || prompt.trim() === ''}
      >
        {isStreaming ? 'Recibiendo…' : 'Enviar'}
      </button>
    </form>
  )
}

export { PromptForm }
