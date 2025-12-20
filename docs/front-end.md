# Front-end (React + Vite)

Tech used:
- React (TSX components under `components/`)
- Vite for development and build
- TypeScript (`tsconfig.json`), CSS and static assets in `assets/`

Key files & folders:
- `components/` — UI pieces (`Dashboard.tsx`, `PortGrid.tsx`, etc.)
- `index.tsx` / `App.tsx` — app bootstrap
- `vite.config.ts` — build config

Development

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

This serves the frontend at `http://localhost:3000` by default.

Production build

```bash
npm run build
```

You can then package the `dist/` files with the backend (see packaging docs).

Notes for contributors
- Keep UI logic in components and small helpers in `services/api.ts`.
- Add tests or storybook as needed for component isolation.
