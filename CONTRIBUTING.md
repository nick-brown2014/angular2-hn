# Contributing

Contributions, bug fixes, and feature requests are welcome.

## Setup

1. Fork and clone the repository.
2. Create a branch from the current React migration feature branch.
3. Install and select the Node version declared in `.nvmrc`:

   ```bash
   nvm install
   nvm use
   ```

4. Install dependencies and start Vite:

   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173).

## Verification

Before opening a pull request, run:

```bash
npm run lint
npm run test
npm run build
```

To verify the production build and generated service worker:

```bash
npm run preview
```

The application uses Vite, React, TypeScript, React Router, TanStack Query, SCSS Modules, Vitest, and
`vite-plugin-pwa`. Firebase Hosting serves the generated `dist/` directory and rewrites SPA routes to `index.html`.
