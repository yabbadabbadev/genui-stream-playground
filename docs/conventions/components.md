# Componentes y hooks

> Este archivo complementa las best practices de `/frontend-best-practices`.
> Consultar primero la skill para las reglas generales.
> Aquí se documentan solo las convenciones **específicas de este proyecto**.

## Patrón vista + hook

Cada pestaña se compone de una vista (`*StreamView.tsx`) y un hook (`use*Stream.ts`) que encapsula TODO el estado asíncrono. La vista es presentacional: recibe `{ messages, status, sendPrompt }` del hook y no conoce `fetch` ni streams.

Contrato común de los hooks:

```ts
const { messages, status, sendPrompt } = useMarkdownStream()
// status: 'idle' | 'streaming' | 'error'  (Streaming.types.ts)
```

- Los hooks crean un `AbortController` por petición, lo guardan en un ref y abortan en el cleanup del `useEffect` de montaje.
- Mientras `status === 'streaming'` se ignoran nuevos `sendPrompt` (guard al inicio).
- Los ids de mensaje se generan con `crypto.randomUUID()`.

## Registro de componentes GenUI

Los componentes generables por el stream se registran en `GEN_UI_COMPONENTS` (`GenUiComponentSlot.tsx`), un mapa `string → ComponentType<{ data: Record<string, unknown> }>`. Un `component` desconocido renderiza un fallback visible, nunca rompe.

Cada componente GenUI (p. ej. `WeatherCard`) recibe `data` sin tipar y **valida campo a campo con defaults seguros** — el JSON viene "de fuera" y no es de fiar:

```ts
const city = typeof data.city === 'string' ? data.city : 'Ciudad desconocida'
```

## Accesibilidad

- Roles ARIA explícitos donde aplica: `role="tablist"`/`role="tab"` en las pestañas, `role="alert"` en errores, `aria-label` en secciones y cards.
- Elementos decorativos (caret de streaming, iconos emoji) con `aria-hidden="true"`.

## Inspector del stream

`StreamInspector` (`app/shared/`) visualiza las trazas del pipeline: recibe `phases` (las fases relevantes de esa pestaña) y `entries` (acumuladas por `useStreamTrace`). El conocimiento didáctico (etiqueta, fase, descripción y ubicación en el código de cada paso) vive en el mapa `STEP_INFO` dentro del componente — si se añade un `StreamTraceStep` nuevo, hay que añadir su entrada ahí (TypeScript obliga: el mapa es `Record` exhaustivo sobre los tipos de paso).

## Render de markdown

`MarkdownRenderer` es el único punto donde se renderiza markdown: `react-markdown` + `remarkGfm`, whitelist `allowedElements` + `unwrapDisallowed` por seguridad, y override del componente `code` para distinguir inline (`<code>` con clase BEM) de bloque (`react-syntax-highlighter` con `PrismLight` y lenguajes registrados a mano para no engordar el bundle).
