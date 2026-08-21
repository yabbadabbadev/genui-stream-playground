# Servicios y streaming

> Este archivo complementa las best practices de `/frontend-best-practices`.
> Consultar primero la skill para las reglas generales.
> Aquí se documentan solo las convenciones **específicas de este proyecto**.

## AgentStreamService

Único cliente de API del proyecto (`app/agent/AgentStreamService.ts`). Convenciones:

- **API de callbacks, no promesas de valor**: cada función de stream recibe `{ onDelta | onEvent, onComplete, onError }` y devuelve `Promise<void>`. El consumidor nunca toca el `ReadableStream`.
- **Cancelación** con `AbortSignal` pasado en la request; un abort cancela el reader y NO dispara `onError` (se filtra `AbortError` en `notifyError`).
- **Decodificación de texto** siempre con `TextDecoder` en modo `{ stream: true }` y flush final (`decode()` sin args) para no romper caracteres multibyte partidos entre chunks.
- **NDJSON**: el decoder acumula buffer, corta por `\n`, se queda la última línea parcial en el buffer y hace `flush()` al cerrar el stream. Líneas en blanco o JSON inválido se descartan en silencio; el shape se valida con el type guard `isAgentEvent` antes de emitir.

## Trazas didácticas (`onTrace`)

Ambas funciones de stream aceptan un callback opcional `onTrace: StreamTraceListener` que emite pasos tipados del pipeline (`StreamTrace.types.ts`): `request-sent`, `chunk-received`, `chunk-decoded`, `line-buffered`, `event-parsed`, `stream-closed`, `stream-error`. Reglas:

- El servicio emite las trazas de red/decodificación/parseo; el paso `render-applied` lo emiten los hooks al aplicar estado.
- Si se añade un paso nuevo al pipeline, debe traza: este proyecto es didáctico y el inspector es parte del contrato.
- `onTrace` es opcional y con default no-op: ningún consumidor está obligado a observar.

## Protocolo de eventos GenUI

Definido en `app/agent/AgentEvent.types.ts` como unión discriminada:

```ts
{ type: 'text', content: string }
{ type: 'ui', component: string, data: Record<string, unknown> }
```

Para añadir un tipo de evento nuevo: ampliar la unión, el type guard `isAgentEvent`, el guion del mock y el render en `GenUiEventContent`.

## Backend simulado (MSW)

- Los handlers (`mocks/handlers.ts`) construyen `ReadableStream` a partir de **guiones declarativos** (`mocks/scripts/*.ts`): arrays de `{ content, delayMs }`. Los guiones son la única fuente de verdad del contenido del stream y exportan también el texto/eventos completos para asserts en tests.
- Los guiones deben ejercitar los casos límite del protocolo a propósito: el de markdown deja un bloque de código abierto entre chunks; el de GenUI parte un JSON por la mitad.
- En navegador el worker arranca en `main.tsx` con `onUnhandledRequest: 'bypass'`; en tests, `setupTests.ts` usa `onUnhandledRequest: 'error'`.
