import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App.tsx'

describe('App', () => {
  it('should switch between the Markdown Stream and GenUI Stream tabs', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('tab', { name: 'Markdown Stream' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByPlaceholderText('Pide un texto en markdown…'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'GenUI Stream' }))

    expect(screen.getByRole('tab', { name: 'GenUI Stream' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByPlaceholderText('Pregunta por el tiempo…'),
    ).toBeInTheDocument()
  })
})
