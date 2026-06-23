# React HN

A Progressive Web App (PWA) Hacker News client built with React 19, TypeScript, Vite, React Router v7, and TanStack Query.

Displays Hacker News feeds (news, newest, show, ask, jobs), item details with recursive comments, user profiles, and supports theming (default/night/AMOLED black).

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router v7** for client-side routing
- **TanStack Query** for data fetching and caching
- **SCSS Modules** for component-scoped styles
- **Vite PWA Plugin** for service worker and offline support
- **Vitest** + React Testing Library for testing
- **Firebase Hosting** for deployment

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server                 |
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview production build locally         |
| `npm run test`    | Run tests with Vitest                    |
| `npm run lint`    | Lint with ESLint                         |

## Project Structure

```
src/
  api/           API service functions (Hacker News API)
  components/    Reusable UI components (Header, Footer, Settings, Loader, ErrorMessage)
  hooks/         React context and hooks (useSettings)
  pages/         Route pages (Feed, ItemDetails, User)
  scss/          Global SCSS variables, themes, and media queries
  test/          Test files
  types/         TypeScript interfaces
  utils/         Utility functions
```

## Deployment

Built to `dist/` and deployed via Firebase Hosting:

```bash
npm run build
firebase deploy
```

## License

[MIT](LICENSE.md)
