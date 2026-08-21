# Estilo de código

> Este archivo complementa las best practices de `/frontend-best-practices`.
> Consultar primero la skill para las reglas generales.
> Aquí se documentan solo las convenciones **específicas de este proyecto**.

## Imports

- **Absolutos desde `src/`** vía paths de tsconfig: `app/*` y `mocks/*` (p. ej. `import { AgentStreamService } from 'app/agent/AgentStreamService'`).
- Relativos solo para el CSS colocado junto al componente (`import './WeatherCard.css'`).
- Tipos siempre con `import type` (el proyecto usa `verbatimModuleSyntax`).

## Exports

- **Named exports agrupados al final del fichero**, nunca `export default` ni exports inline:

```ts
const AgentStreamService = { streamMarkdown, streamGenUi }

export { AgentStreamService }
export type { GenUiStreamCallbacks, MarkdownStreamCallbacks, StreamRequest }
```

## Tipos

- `type` en lugar de `interface` en todo el proyecto.
- Datos externos entran como `unknown` y se validan con type guards antes de usarse (ver `isAgentEvent` en `AgentStreamService.ts`).
- Uniones discriminadas por `type` para eventos (`AgentEvent`).

## Funciones

- Arrow functions con `const`, también para componentes React.
- Sin clases: los "objetos de servicio" son objetos literales que agrupan funciones (`AgentStreamService`).

## CSS

- Metodología **BEM** estricta: `bloque__elemento--modificador` (p. ej. `markdown-stream__message--agent`).
- Un fichero CSS por componente, colocado junto al `.tsx` y con el mismo nombre.

## Herramientas

- Lint: **oxlint** (config en `.oxlintrc.json`). Formato: **Prettier** (`.prettierrc`: sin punto y coma, comillas simples, trailing commas).
