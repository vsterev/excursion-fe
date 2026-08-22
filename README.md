# trips-frontend

React 19 + TypeScript + Vite — public tourist catalog and admin panel for Solvex Tourist Agency.

## Commands

```bash
yarn dev        # Vite dev server with HMR (http://localhost:5173)
yarn build      # TypeScript check + production build
yarn lint       # ESLint
yarn preview    # Preview production build locally
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE` | Yes | Full API base URL including `/api`. Dev: `http://localhost:4010/api`. Prod: `https://api.trips.solvex.bg/api` |
| `VITE_SITE_URL` | Prod only | Frontend production URL without trailing slash — used for `canonical` links, `og:url` and the sitemap reference. Prod: `https://trips.solvex.bg` |

## SEO

### `public/robots.txt`

Blocks search engines from indexing `/admin/*` pages. Points to the sitemap at `https://trips.solvex.bg/sitemap.xml`.

### `public/llms.txt`

Describes the site for AI search engines (Perplexity, ChatGPT Search, Gemini). Lists all sections and the public API. See [llmstxt.org](https://llmstxt.org) for the format spec.

### Canonical & Open Graph

`SiteHelmet` (rendered on every page) injects:
- `<link rel="canonical">` — prevents duplicate-content issues from `?lang=` query params
- `og:url`, `og:image`, `twitter:card` — correct preview when the URL is shared in social media or chat apps
- `<meta name="robots" content="noindex, nofollow">` — on every `/admin/*` page

Detail pages (`ExcursionDetailPage`, `ResortDetailPage`) additionally inject:
- `og:image` — the cover photo of the excursion / resort
- `<script type="application/ld+json">` — Schema.org structured data (`TouristAttraction` / `TouristDestination`) for Google rich results

### Sitemap

The sitemap is served dynamically by the backend at `GET /sitemap.xml` and includes all excursion, resort, and representative URLs. It is referenced in `robots.txt` and regenerates on every request (cached 1 hour).

## Architecture notes

**Routing.** React Router v7. Two layout trees: `<AppLayout>` for public pages and `<AdminLayout>` for `/admin/*`. All page components are lazy-loaded. Admin routes are wrapped in `<PrivateRoute>`.

**API client.** `src/api.ts` — public endpoints. `src/adminApi.ts` — authenticated admin requests. Use `resolvePhotoUrl()` for image URLs and `rewriteUploadUrlsInHtml()` for rich-text HTML that may contain `/uploads/` paths.

**i18n.** i18next with browser language detection. Supported: `en`, `ro`, `ru`, `uk`. Translation files in `src/i18n/`.

**UI library.** [Reshaped](https://reshaped.so/). Admin forms use `react-quill-new` for rich text. Reservations table uses AG Grid Community.
