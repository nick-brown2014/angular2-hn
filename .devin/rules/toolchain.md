---
trigger: model_decision
description: When building, testing, linting, installing dependencies, or running the angular2-hn app
---

The repo is mid-migration from Angular 9 to React 19. Which toolchain applies depends on the branch you're on.

## React branches (`react-migration-branch` and its working branches)
Stack: React 19 + TypeScript, Vite, React Router v7, TanStack Query v5, SCSS Modules, Vitest + React Testing Library, vite-plugin-pwa. Firebase hosting serves `dist/`.

- Dev server: `npm run dev` (Vite, http://localhost:5173) — NOT `npm start`/port 4200.
- Build/type check: `npm run build` (`tsc -b && vite build`).
- Tests: `npm run test` (`vitest run`).
- Lint: `npm run lint` (ESLint 9 flat config in `eslint.config.js`).

Node version: Vite requires Node 20+, but the machine defaults to Node 14 and `.bashrc` re-runs `nvm use 14` in every new shell, silently reverting `nvm use 22`. Invoke binaries with the absolute Node 22 path instead, e.g.
`$HOME/.nvm/versions/node/v22.12.0/bin/node ./node_modules/.bin/vite build`.
Running vite/npm under Node 14 fails with `SyntaxError: Unexpected token '??='`.

External API: the app uses `https://node-hnapi.herokuapp.com`. Feed and item/comment endpoints work; `/user/:id` returns 404 (external issue, not app code — the Angular app used the same endpoint).

## Legacy Angular branches (`master`)
Angular 9 / webpack 4; must be built/tested with **Node 14** (`nvm use 14`, pinned by `.nvmrc`). Node >=17 throws `ERR_OSSL_EVP_UNSUPPORTED`; Node >=18 crashes the karma webpack middleware.

- Headless tests: `CHROME_BIN=<chrome> npx ng test --watch=false --browsers=ChromeHeadlessCI` (launcher defined in `karma.conf.js`; Chrome at `/opt/.devin/chrome/chrome/*/chrome-linux64/chrome`).
- `npm run lint` has many pre-existing failures (settings.service.ts, user.component.ts, ...). Keep new files lint-clean; don't fix the backlog.
- `hackernews-api.service.ts` uses `unfetch` (backed by `XMLHttpRequest`, not `fetch`), so unit tests must stub `XMLHttpRequest`.
