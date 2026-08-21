# Arquitectura

> Este archivo complementa las best practices de `/frontend-best-practices`.
> Consultar primero la skill para las reglas generales.
> Aquí se documentan solo las convenciones **específicas de este proyecto**.

## Organización: feature-based bajo `src/app/`

Cada pestaña del playground es una feature con su carpeta: `markdown/`, `genUi/`. Lo transversal vive en `shared/` y la capa de dominio del streaming en `agent/`.

| Carpeta | Responsabilidad | Puede importar de |
|---|---|---|
| `app/agent/` | Consumo y decodificación de streams. **Sin React** (ni hooks ni JSX) | — |
| `app/markdown/`, `app/genUi/` | Vista + hook de cada pestaña | `agent/`, `shared/` |
| `app/shared/` | Componentes y tipos reutilizados por ambas pestañas | — |
| `mocks/` | Backend simulado con MSW (handlers, guiones, manualStream) | `app/agent/` (solo tipos) |

## Reglas de dependencia

- `agent/` es dominio puro: no conoce React ni las vistas. Expone callbacks (`onDelta`, `onEvent`, `onComplete`, `onError`).
- Los hooks (`useMarkdownStream`, `useGenUiStream`) son la única frontera entre `agent/` y React: traducen callbacks a estado.
- `mocks/` solo importa tipos de `app/` (p. ej. `AgentEvent` en los guiones), nunca al revés en runtime — la app solo toca los mocks en `main.tsx` (arranque del worker) y en los tests.

## Dónde va cada cosa nueva

- Nuevo componente GenUI → `app/genUi/` + registrarlo en `GEN_UI_COMPONENTS` (`GenUiComponentSlot.tsx`).
- Nuevo protocolo de stream → decoder en `agent/AgentStreamService.ts` + guion en `mocks/scripts/` + handler en `mocks/handlers.ts`.
- Nueva pestaña → carpeta propia en `app/` + entrada en `TABS` (`App.tsx`).
