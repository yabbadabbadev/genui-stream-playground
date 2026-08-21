import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { MarkdownStreamView } from 'app/markdown/MarkdownStreamView'
import { createManualStream } from 'mocks/manualStream'
import { server } from 'mocks/server'

const sendPrompt = async (prompt: string) => {
  const user = userEvent.setup()
  await user.type(screen.getByRole('textbox', { name: 'Prompt' }), prompt)
  await user.click(screen.getByRole('button', { name: 'Enviar' }))
}

describe('MarkdownStreamView', () => {
  it('should attach the streamed markdown to the DOM progressively', async () => {
    render(<MarkdownStreamView />)

    await sendPrompt('stream some markdown')

    expect(
      await screen.findByRole('heading', { name: 'Streaming playground' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Stream finished ✅')).not.toBeInTheDocument()

    expect(
      await screen.findByText('Stream finished ✅', undefined, { timeout: 4000 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('cell', { name: 'Progressive markdown rendering' }),
    ).toBeInTheDocument()
  })

  it('should keep rendering while the code block is still incomplete', async () => {
    const manualStream = createManualStream()
    server.use(http.post('/api/chat/markdown', () => manualStream.toResponse()))
    const { container } = render(<MarkdownStreamView />)

    await sendPrompt('stream some markdown')
    manualStream.emit(
      '# Partial answer\n\n```typescript\nconst reader = body.getReader()\n',
    )

    expect(
      await screen.findByRole('heading', { name: 'Partial answer' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(
        container.querySelector('.markdown-renderer__code-block'),
      ).toHaveTextContent('const reader = body.getReader()')
    })

    manualStream.emit('const done = true\n```\n\nAll closed ✅\n')
    manualStream.close()

    expect(await screen.findByText('All closed ✅')).toBeInTheDocument()
    expect(
      container.querySelector('.markdown-renderer__code-block'),
    ).toHaveTextContent('const done = true')
  })

  it('should explain every pipeline step in the stream inspector', async () => {
    const manualStream = createManualStream()
    server.use(http.post('/api/chat/markdown', () => manualStream.toResponse()))
    render(<MarkdownStreamView />)

    const inspector = screen.getByRole('complementary', {
      name: 'Inspector del stream',
    })
    expect(
      within(inspector).getByText('Envía un prompt para ver el pipeline en acción.'),
    ).toBeInTheDocument()

    await sendPrompt('stream some markdown')
    manualStream.emit('# Hello\n')

    expect(
      await within(inspector).findByText('Petición enviada'),
    ).toBeInTheDocument()
    expect(
      await within(inspector).findByText('Chunk recibido'),
    ).toBeInTheDocument()
    expect(within(inspector).getByText('Chunk decodificado')).toBeInTheDocument()
    expect(within(inspector).getByText('Render actualizado')).toBeInTheDocument()
    await waitFor(() => {
      expect(within(inspector).getByText('Render')).toHaveAttribute(
        'aria-current',
        'step',
      )
    })
    expect(within(inspector).queryByText('Parseo')).not.toBeInTheDocument()

    manualStream.close()

    expect(
      await within(inspector).findByText('Stream cerrado'),
    ).toBeInTheDocument()
    expect(within(inspector).getByText('Render')).not.toHaveAttribute(
      'aria-current',
    )
  })
})
