# LLM Streaming Playground (genui-stream)

Playground **didáctico** para explorar cómo se consumen y renderizan respuestas de LLM por streaming en el navegador. No hay backend real: todo el streaming lo simula [Mock Service Worker (MSW)](https://mswjs.io/) interceptando `fetch` con `ReadableStream` y latencias artificiales.

La app tiene dos pestañas, cada una demuestra un protocolo distinto:

| Pestaña | Endpoint mock | Protocolo | Qué demuestra |
|---|---|---|---|
| **Markdown Stream** | `POST /api/chat/markdown` | Texto markdown plano en chunks | Render progresivo de GFM resiliente a markdown incompleto (bloques de código a medio cerrar) |
| **GenUI Stream** | `POST /api/chat/gen-ui` | NDJSON (un evento JSON por línea) | Generative UI: eventos `text` y `ui` que se sustituyen por componentes React reales (`WeatherCard`) |

## Arranque rápido

```bash
npm install
npm run dev        # abre Vite con MSW activo en el navegador
```

| Acción | Comando |
|---|---|
| Desarrollo | `npm run dev` |
| Tests (watch) | `npm test` |
| Tests (CI, una pasada) | `npm run test:ci` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Preview del build | `npm run preview` |

## Cómo funciona el streaming (el recorrido didáctico)

El flujo completo de un prompt, de punta a punta:

1. **UI** — `PromptForm` envía el prompt; el hook de la pestaña (`useMarkdownStream` / `useGenUiStream`) crea los mensajes y un `AbortController`.
2. **Fetch** — `AgentStreamService` hace `POST` al endpoint y obtiene `response.body`, un `ReadableStream<Uint8Array>`.
3. **Lectura** — `readTextChunks` itera con `reader.read()` y decodifica bytes → texto con `TextDecoder` en modo `stream: true` (respeta caracteres multibyte partidos entre chunks).
4. **Parsing** (solo GenUI) — un decoder NDJSON acumula un buffer, corta por `\n`, parsea cada línea con `JSON.parse` y valida el shape (`type: 'text' | 'ui'`) antes de emitir el evento. Las líneas incompletas esperan en el buffer al siguiente chunk.
5. **Estado** — los callbacks (`onDelta` / `onEvent`) actualizan el estado React del hook: Markdown concatena deltas sobre el mismo mensaje; GenUI añade un mensaje por evento.
6. **Render** — `MarkdownRenderer` re-parsea el markdown acumulado en cada delta (`react-markdown` + `remark-gfm`, `allowedElements` por seguridad, `react-syntax-highlighter` para bloques de código). En GenUI, `GenUiComponentSlot` mapea `event.component` a un componente del registro (`GEN_UI_COMPONENTS`).

### El inspector del stream

Cada pestaña incluye un panel **"Inspector del stream"** que hace visible este recorrido en vivo: una barra de fases (Petición → Lectura → Decodificación → Parseo → Render) que se ilumina según avanza el stream, y un timeline con cada paso instrumentado (chunks con sus bytes, texto decodificado, la línea NDJSON incompleta esperando en el búfer, eventos parseados…). Cada entrada del timeline se expande para explicar qué hace ese paso y en qué función del código vive. La instrumentación sale del propio servicio: `AgentStreamService` acepta un callback opcional `onTrace(step)` y el hook `useStreamTrace` acumula las trazas con su timestamp.

El lado servidor (mock) está en `src/mocks/`: `handlers.ts` convierte guiones (`scripts/*.ts`) en `ReadableStream` con delays por chunk. El guion de markdown deja un bloque de código abierto varios chunks para probar la resiliencia del parser; el de GenUI parte el JSON de la `WeatherCard` en dos chunks para probar el buffer NDJSON.

## Estructura

```
src/
├── App.tsx                  # Tabs del playground
├── app/
│   ├── agent/               # AgentStreamService + tipos de eventos (dominio, sin React)
│   ├── markdown/            # Vista + hook de la pestaña Markdown
│   ├── genUi/               # Vista + hook + registro de componentes GenUI
│   └── shared/              # MarkdownRenderer, PromptForm, tipos comunes
└── mocks/                   # MSW: handlers, guiones de stream, manualStream (tests)
```

## Stack

React 19 · TypeScript (strict) · Vite 8 · Vitest 4 + React Testing Library · MSW 2 · react-markdown + remark-gfm + react-syntax-highlighter · CSS con metodología BEM · oxlint + Prettier.

## Documentación

- [CLAUDE.md](./CLAUDE.md) — ground rules para trabajar con AI en este repo.
- [docs/conventions/](./docs/conventions/) — convenciones específicas del proyecto (arquitectura, componentes, servicios, testing, estilo, git).
