import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { GenUiStreamView } from 'app/genUi/GenUiStreamView'
import { server } from 'mocks/server'

const sendPrompt = async (prompt: string) => {
  const user = userEvent.setup()
  await user.type(screen.getByRole('textbox', { name: 'Prompt' }), prompt)
  await user.click(screen.getByRole('button', { name: 'Enviar' }))
}

describe('GenUiStreamView', () => {
  it('should replace the streamed ui payload with the WeatherCard component', async () => {
    render(<GenUiStreamView />)

    await sendPrompt('¿qué tiempo hace?')

    expect(
      await screen.findByText('Checking the live weather for Valencia…'),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Valencia' }),
    ).toBeInTheDocument()
    expect(screen.getByText('22°C')).toBeInTheDocument()
    expect(screen.getByText('sunny')).toBeInTheDocument()
    const conversation = screen.getByRole('list', { name: 'Conversación' })
    expect(
      within(conversation).queryByText(/"type"\s*:\s*"ui"/),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByText('Perfect day for a walk. Anything else?'),
    ).toBeInTheDocument()
  })

  it('should show a fallback when the ui component is not registered', async () => {
    server.use(
      http.post(
        '/api/chat/gen-ui',
        () =>
          new HttpResponse(
            '{"type":"ui","component":"StockChart","data":{}}\n',
            { headers: { 'Content-Type': 'application/x-ndjson' } },
          ),
      ),
    )
    render(<GenUiStreamView />)

    await sendPrompt('dame un gráfico de bolsa')

    expect(
      await screen.findByText('Componente desconocido: StockChart'),
    ).toBeInTheDocument()
  })

  it('should trace the buffered json line and the parsed events in the inspector', async () => {
    render(<GenUiStreamView />)

    await sendPrompt('¿qué tiempo hace?')

    const inspector = screen.getByRole('complementary', {
      name: 'Inspector del stream',
    })
    expect(
      await within(inspector).findByText('Línea incompleta en búfer'),
    ).toBeInTheDocument()
    expect(
      await within(inspector).findByText('Stream cerrado'),
    ).toBeInTheDocument()
    expect(within(inspector).getAllByText('Evento parseado')).toHaveLength(3)
    expect(within(inspector).getByText('Parseo')).toBeInTheDocument()
  })
})
