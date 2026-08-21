# CLAUDE.md

Playground **didáctico** de streaming LLM: la prioridad es que el código enseñe (claridad de los protocolos de stream por encima de features). Ver [README.md](./README.md) para el recorrido completo del flujo.

## Regla crítica: Convenciones primero

Antes de cualquier cambio, consultar las convenciones del proyecto. Las convenciones del proyecto tienen prioridad sobre las best practices del plugin.

**Jerarquía de autoridad:**
1. Convenciones del proyecto (`docs/conventions/`)
2. Best practices del plugin (`/frontend-best-practices`)

### Convenciones del proyecto (precargadas)

@docs/conventions/git-workflow.md
@docs/conventions/code-style.md
@docs/conventions/architecture.md
@docs/conventions/components.md
@docs/conventions/services.md
@docs/conventions/testing.md

## Entorno y Comandos

**Stack:** React 19, TypeScript strict, Vite 8, Vitest 4 + React Testing Library, MSW 2, react-markdown/remark-gfm/react-syntax-highlighter, CSS BEM, oxlint + Prettier.

### Comandos

| Acción | Comando |
|---|---|
| Desarrollo | `npm run dev` |
| Tests (watch) | `npm test` |
| Tests (una pasada) | `npm run test:ci` |
| Lint | `npm run lint` |
| Build (tsc + vite) | `npm run build` |

## Idioma

- Español: documentación, comunicación con el usuario, convenciones, planes. También los textos de UI.
- Inglés: código, tests, commits, nombres de branches, PRs.

## Principios fundamentales

### Prioridades (en orden)
1. Seguridad y tests passing
2. Simplicidad (YAGNI, KISS) — es una demo didáctica, no un producto
3. Arquitectura limpia
4. Estilo y convenciones

### Principios de diseño
- TDD estricto: nunca escribir código de producción sin test que lo pida
- Cambios atómicos: cada commit es un paso lógico independiente
- YAGNI: no implementar nada que no se necesite ahora
- `app/agent/` se mantiene libre de React; los hooks son la única frontera con la UI

## Flujos de trabajo

### Skills disponibles

| Skill | Cuándo usar |
|---|---|
| `/feature-plan` | Planificar una feature nueva en slices verticales |
| `/aitdd` | Implementar un slice con TDD estricto |
| `/retrospective` | Analizar la sesión y proponer mejoras |
| `/frontend-best-practices` | Consultar best practices de frontend-engineering |

## Rutas del proyecto

| Concepto | Ruta |
|---|---|
| Convenciones del proyecto | `docs/conventions/` |
| Planes de feature | `.aiplans/feature-<slug>/plan.md` |
| Log de implementación | `.aiplans/feature-<slug>/implementation_log.md` |
