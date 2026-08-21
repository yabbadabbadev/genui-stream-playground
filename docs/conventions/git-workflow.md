# Git workflow

> Este archivo complementa las best practices de `/frontend-best-practices`.
> Nota: el repositorio git aún no está inicializado; estas reglas aplican desde el momento en que lo esté.

## Regla crítica

**Nunca commitear directamente en `master`/`main`.** Crear siempre una rama de trabajo antes de commitear (`git switch -c <branch>`). Aplica también a `--amend` y `-a`.

## Ramas

- Formato: `feature/<slug>`, `fix/<slug>`, `docs/<slug>` (slug en inglés, kebab-case).

## Commits

- **Conventional Commits** en inglés: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Cambios atómicos: cada commit es un paso lógico independiente y deja los tests en verde.

## Checklist pre-commit

1. Rama de trabajo (no `master`/`main`).
2. `npm run lint` sin errores.
3. `npm run test:ci` en verde.
4. Revisar el diff staged: solo lo que pertenece al cambio.
