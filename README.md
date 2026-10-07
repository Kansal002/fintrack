# FinTrack — Personal Finance Dashboard

**Track income, expenses and budgets in a fast, accessible dashboard — built with Next.js 16, React 19, React Query and Tailwind CSS v4.**

[**Live demo →**](https://<your-site>.netlify.app) &nbsp;·&nbsp; No sign-up needed: click **“Try demo account”** on the login page.

[![CI](https://github.com/Kansal002/fintrack/actions/workflows/ci.yml/badge.svg)](https://github.com/Kansal002/fintrack/actions/workflows/ci.yml)

---

## Screenshots

> _Add screenshots to `docs/screenshots/` and they'll render here._

| Dashboard (light)                                  | Dashboard (dark)                             |
| -------------------------------------------------- | -------------------------------------------- |
| ![Dashboard](docs/screenshots/dashboard.png)       | ![Dashboard dark](docs/screenshots/dark.png) |
| **Transactions**                                   | **Mobile**                                   |
| ![Transactions](docs/screenshots/transactions.png) | ![Mobile](docs/screenshots/mobile.png)       |

---

## Features

- **Dashboard** — KPI cards (balance, monthly income, expenses, savings rate) with % change vs the same period last month, an income-vs-expense bar chart, a spending-by-category donut and recent activity. Every async section has a skeleton loader.
- **Transactions** — debounced search, filters (type, category, date range), sorting by date/amount and pagination. **Filters live in the URL**, so any view is shareable and survives a reload. Add/edit in an accessible modal, delete with confirmation, and **export the filtered set to CSV**.
- **Optimistic updates everywhere** — creates, edits, deletes and budget changes appear instantly, then **roll back with an explanatory toast** if the request fails.
- **Budgets** — monthly limits per category with green / amber / red progress (always paired with an icon + label, never colour alone), inline editing and a month switcher.
- **Settings** — profile name, number format (Indian `1,23,456` vs international), currency display (₹ / INR), light / dark / system theme, **“Simulate network errors”** toggle, and reset / clear demo data.
- **Auth** — sign up / log in with validated forms, SHA-256 password hashing (Web Crypto), protected routes with `?next=` redirect, cross-tab session sync, and a one-click **demo account** seeded with ~6 months of realistic Indian (₹ INR) transactions.
- **Responsive & themed** — sidebar on desktop, bottom tab bar on mobile, dark mode without a flash of the wrong theme.
- **Accessible** — semantic landmarks and tables, labelled inputs with `aria-describedby` errors, visible focus rings, skip link, a native `<dialog>` with focus trap / Escape / focus restore, `aria-live` toasts, `aria-sort` headers, and screen-reader data tables behind each chart.

## Tech stack

| Concern       | Choice                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, `output: "export"`), React 19, TypeScript (strict) |
| Data fetching | TanStack Query v5 (caching, optimistic updates, rollback)                  |
| Styling       | Tailwind CSS v4 (CSS-first `@theme` tokens), Geist via `next/font`         |
| Forms         | react-hook-form + zod                                                      |
| Charts        | Recharts, code-split with `next/dynamic` (`ssr: false`)                    |
| UI            | Hand-built primitives in `src/components/ui`, lucide-react icons, sonner   |
| Testing       | Vitest + React Testing Library + user-event (jsdom)                        |
| Quality       | ESLint (`eslint-config-next`), Prettier, GitHub Actions CI                 |
| Hosting       | Netlify (static site)                                                      |

## Architecture

```
src/
├── app/                  # Routes only — thin pages that compose features
│   ├── (auth)/           #   /login, /signup (redirect away if signed in)
│   └── (app)/            #   /dashboard, /transactions, /budgets, /settings (RequireAuth + AppShell)
├── components/
│   ├── ui/               # Design-system primitives: Button, Input, Select, Dialog, Card, Badge, Skeleton…
│   └── layout/           # App shell, sidebar / bottom nav, page header
├── features/             # Feature modules: components + hooks + schemas, co-located with tests
│   ├── auth/  dashboard/  transactions/  budgets/  settings/
├── hooks/                # Cross-cutting hooks (theme, money formatting, debounced callback)
├── lib/
│   ├── api/              # Mock REST backend (the only code that touches storage)
│   ├── format.ts         # Currency / percent / date formatting (Intl, cached formatters)
│   ├── query-keys.ts     # Hierarchical React Query keys
│   └── csv.ts  dates.ts  categories.ts  theme.ts
├── types/                # Shared domain types
└── test/                 # Vitest setup + test utilities
```

### Mock API layer (`src/lib/api`)

There is no server — but the UI doesn't know that. `src/lib/api` exposes an `api` object shaped like a REST client (`api.transactions.list(query)`, `.create`, `.update`, `.remove`, `api.summary.get()`, `api.budgets.update(...)`, `api.auth.*`). Every call goes through `request()`, which:

- adds **300–700 ms of simulated latency**,
- can **fail randomly** at a configurable rate (Settings → _Simulate network errors_),
- returns a **structured clone**, so the UI can never mutate “server” state by reference,
- rejects with a typed `ApiError` (`status`, `code`) — including `401` when there's no session.

Data is persisted **per user** in `localStorage`. Filtering, sorting, pagination and dashboard aggregation are pure functions (`transaction-query.ts`, `summary.ts`), unit-tested independently. Swapping in a real backend means re-implementing `src/lib/api` with `fetch` — no component changes.

### Optimistic updates

Mutations in `features/transactions/hooks.ts` follow one pattern:

1. `onMutate` — cancel in-flight queries, **snapshot every cached transaction list**, and patch each one with a pure transform (`optimistic.ts`) that respects that list's own filters, sort order and page.
2. `onError` — restore the snapshot and show a toast explaining what was reverted.
3. `onSettled` — invalidate transactions, the dashboard summary and budgets so derived data re-syncs.

The rollback path is covered by tests that hold the request open, assert the optimistic cache state, reject, and assert the exact original state is restored.

### Performance

- **Static export** — every route is pre-rendered HTML served from a CDN; no server or cold starts.
- **Code-splitting** — Recharts lives in its own async chunks loaded only by `/dashboard` (via `next/dynamic`, `ssr: false`, with skeleton fallbacks); no other route ships chart code.
- `keepPreviousData` keeps the current table visible while the next page/filter loads, so the UI never flashes empty.
- Theme is applied by a tiny inline script before first paint; fonts are self-hosted by `next/font`.

## Getting started

Requires Node.js ≥ 20.9 (CI uses Node 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

Then click **Try demo account**, or sign up — new accounts start empty so you can see the empty states, with a one-click “Load sample data”.

### Scripts

| Script               | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Start the dev server                              |
| `npm run build`      | Production build + static export to `out/`        |
| `npm start`          | Serve the static `out/` folder locally            |
| `npm run lint`       | ESLint (zero warnings allowed)                    |
| `npm run typecheck`  | `tsc --noEmit`                                    |
| `npm test`           | Run the Vitest suite once                         |
| `npm run test:watch` | Vitest in watch mode                              |
| `npm run format`     | Format with Prettier (incl. Tailwind class order) |

### Try the failure handling

1. Settings → turn on **Simulate network errors** and set the rate to 100%.
2. Go to Transactions and delete a row: it disappears instantly, then **reappears** with a “Couldn't delete transaction” toast.
3. Reload any page: with an empty cache, each section shows its error state and a **Try again** button.

## Deploying to Netlify

The repo includes a `netlify.toml` (build command, publish dir, Node version, caching and security headers).

1. Push the repo to GitHub.
2. In Netlify: **Add new site → Import an existing project** and pick the repo.
3. Netlify reads `netlify.toml` automatically — build command `npm run build`, publish directory `out`.
4. Deploy, then replace the demo link at the top of this README.

Or from the CLI: `npx netlify-cli deploy --build --prod`.

## Demo credentials

None needed — use the **Try demo account** button on the login page. All data stays in your browser's `localStorage`; Settings → **Reset demo data** restores it at any time.

## Notes & limitations

- Auth is a client-side demo: SHA-256 (salted with the email) avoids storing plaintext, but a real app would hash with a slow KDF on a server and use HTTP-only cookies.
- Amounts are stored in rupees; multi-currency conversion is out of scope (the currency setting changes display only).
