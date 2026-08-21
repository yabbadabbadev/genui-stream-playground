# Testing

> Este archivo complementa las best practices de `/frontend-best-practices`.
> Consultar primero la skill para las reglas generales.
> Aquí se documentan solo las convenciones **específicas de este proyecto**.

## Setup

- **Vitest 4** con `globals: true` y entorno `jsdom` (`vite.config.ts`); no hace falta importar `describe/it/expect`.
- `setupTests.ts` registra jest-dom y el servidor MSW de Node (`mocks/server.ts`) con `onUnhandledRequest: 'error'`: toda request no manejada rompe el test.
- Tests **colocados** junto al código (`X.tsx` → `X.test.tsx`), nombres `should ...`.

## Estilo: tests de integración sobre la vista

Se testea la vista completa (`render(<MarkdownStreamView />)`) contra la red mockeada, no los hooks ni el servicio por separado (el servicio tiene además su propio test unitario contra MSW). Interacción siempre con `userEvent.setup()` y queries por rol accesible:

```ts
await user.type(screen.getByRole('textbox', { name: 'Prompt' }), prompt)
await user.click(screen.getByRole('button', { name: 'Enviar' }))
```

## Control fino del stream: `createManualStream`

Para probar estados intermedios (markdown a medias, JSON partido) se sobreescribe el handler con `server.use(...)` y un stream manual que el test controla paso a paso:

```ts
const manualStream = createManualStream()
server.use(http.post('/api/chat/markdown', () => manualStream.toResponse()))
// ...
manualStream.emit('# Partial answer\n\n```typescript\n...')
// asserts del estado intermedio
manualStream.emit('```\n\nAll closed ✅\n')
manualStream.close()
```

Regla: si el test necesita afirmar algo **durante** el stream, usa `manualStream`; si solo importa el resultado final, vale el guion por defecto de los handlers.

## Asserts

- Preferir `findBy*` (espera async) y `waitFor` para estado que llega por stream; los asserts negativos (`queryBy* ... not.toBeInTheDocument()`) van antes de que el stream avance.
- Los guiones exportan el contenido completo (`markdownFullText`, `genUiEvents`) para no duplicar strings en los tests.
