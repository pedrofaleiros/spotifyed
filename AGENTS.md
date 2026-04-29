# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project. Application routes live in `app/`: `app/page.tsx` is the login entry point, `app/home/page.tsx` is the authenticated home page, and `app/api/*/route.ts` contains Spotify OAuth and token API handlers. Reusable UI lives in `app/components/`, with component-local CSS in `app/components/styles.module.css` and global Tailwind styles in `app/globals.css`. Spotify API helpers and shared response types are in `services/`. Static assets belong in `public/`, currently including `public/icons/spotify.svg`.

## Build, Test, and Development Commands

- `npm run dev`: starts the local Next.js dev server with Turbopack.
- `npm run build`: creates a production build and runs Next.js validation.
- `npm run start`: serves the production build after `npm run build`.
- `npm run lint`: runs the configured Next/ESLint checks.
- `npm test`: runs the Vitest suite once.
- `npm run test:coverage`: runs Vitest with the 100% coverage thresholds.

Use `npm install` to restore dependencies from `package-lock.json`. Local Spotify login requires the environment variables used by the API routes: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`, and `NEXT_PUBLIC_BASE_URL`.

## Coding Style & Naming Conventions

Write TypeScript and React function components. Use PascalCase for components (`UserTopTracks`), camelCase for functions and state (`handleLogout`, `accessToken`), and kebab-free route directory names that match URLs. Prefer the `@/*` import alias for root-relative imports, especially from `services/`. Styling is primarily Tailwind utility classes; use CSS modules only for styles that are awkward to express inline. Keep client components marked with `"use client"` only when they need browser APIs, state, or effects.

## Testing Guidelines

Tests use Vitest, React Testing Library, jsdom, and V8 coverage. Keep tests next to the related source file and name them `.test.ts` or `.test.tsx`. Coverage thresholds are 100% for statements, branches, functions, and lines across app and service code. Verify changes with `npm run test:coverage`, `npm run lint`, and `npm run build`.

## Commit & Pull Request Guidelines

Recent history uses short messages, sometimes in Portuguese, such as `refactor tela login` and `chore: upgrade next dependencies`. Keep commits concise and imperative; prefer a lightweight prefix when useful (`feat:`, `fix:`, `refactor:`, `chore:`). Pull requests should describe the change, list verification commands run, mention required environment changes, and include screenshots for visible UI updates.

## Agent-Specific Instructions

Do not commit secrets or print `.env` contents. Keep edits scoped to the requested area, avoid broad refactors, and preserve the existing Portuguese UI copy unless the task asks for text changes.
