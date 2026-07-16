<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service Worker precaching + dynamic content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Installable PWA with offline support.

<p align="center">
  <img src = "http://i.imgur.com/fzJzLFO.png" width=500>
</p>

## Tech Stack

This project was originally an Angular 9 PWA and has been migrated to a modern React stack:

- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)** — UI and type safety
- **[Vite](https://vite.dev/)** — dev server and build tool
- **[React Router v7](https://reactrouter.com/)** — client-side routing
- **[TanStack Query v5](https://tanstack.com/query/latest)** — data fetching and caching
- **SCSS Modules** (via `sass`) — component-scoped styling
- **[Vitest](https://vitest.dev/)** + **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** — unit/component tests
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** — service worker + web app manifest generation
- **ESLint 9** (flat config) — linting

## Data source

The app reads from the public Hacker News API at `https://node-hnapi.herokuapp.com`.

> **Note:** The feed and item/comment endpoints work as expected, but the upstream `/user/:id` endpoint currently returns a 404. This is an external API issue (the original Angular app used the same endpoint); the app renders a clean error state for user profiles when this happens.

## Prerequisites

- **Node.js 20+** (Node 22 recommended). The toolchain (Vite 8, Vitest 3) requires Node 20 or newer and will not run on older versions.
- npm

## Setup

```bash
# Clone or download the repo
npm install
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server at [http://localhost:5173](http://localhost:5173) |
| `npm run build` | Type-check and build for production (`tsc -b && vite build`) into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the test suite (`vitest run`) |
| `npm run lint` | Lint the project with ESLint 9 (flat config in `eslint.config.js`) |

## Offline support & PWA

Offline support is provided by [vite-plugin-pwa](https://vite-pwa-org.netlify.app/), which uses Workbox under the hood. The production build (`npm run build`) generates the service worker (`dist/sw.js`) and the web app manifest (`dist/manifest.webmanifest`) automatically — there is no separate precache step.

To test the service worker locally, build the app and serve the output:

```bash
npm run build
npm run preview
```

## Themes

Built-in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

## Deployment

Production hosting is on [Firebase Hosting](https://firebase.google.com/docs/hosting), serving the `dist/` output directory (see `firebase.json`). A catch-all rewrite routes all requests to `index.html` for SPA client-side routing.

## Contributing

See [CONTRIBUTING.md](/CONTRIBUTING.md).

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
