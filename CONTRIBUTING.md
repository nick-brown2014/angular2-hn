# Contributing

Thank you for your interest in contributing! Please feel free to put up a PR for any issue or feature request.
Even if you have little to no experience with React, I'll be more than happy to help. :)

## Prerequisites

- **Node.js 20+** (Node 22 recommended). The toolchain (Vite 8, Vitest 3) requires Node 20 or newer.
- npm

## Setup

1. Fork the repo
2. Clone your fork
3. Make a branch for your feature or bug fix
4. Install dependencies: `npm install`
5. Run `npm run dev` and open [http://localhost:5173](http://localhost:5173) in a browser
6. Work your magic

## Before you commit

Run the full suite and make sure everything passes:

- `npm run lint` — lint with ESLint 9 (flat config)
- `npm run test` — run the test suite (`vitest run`)
- `npm run build` — type-check and produce a production build (`tsc -b && vite build`) in `dist/`

To verify the PWA/service worker locally, run `npm run build` followed by `npm run preview` and load the served app.

## Opening a pull request

1. Add yourself to the [contributor's list](/README.md#contributors) in the README!
2. Commit your changes and reference the issue you're addressing (for example: `git commit -am 'Commit message. Closes #5'`)
3. Push your branch to your fork
4. Open a pull request against the active feature branch (do not target `master` directly)
5. Have your branch get merged in! :star2:

If you experience a problem at any point, please don't hesitate to file an issue or send me a message!
