# DrFX Admin

Telegram signal republishing and content management Worker with an embedded Telegram Mini App. This repository is an **export of the deployed Cloudflare Worker v56** (2026-11-06), including the trading-signal parser update for ranged entries.

## Repository layout

| Path | Description |
| --- | --- |
| `src/worker-runtime.mjs` | Worker application: Telegram webhook, signal parsing and validation, publishing, admin API, recovery and D1 integration |
| `web/index.html`, `web/app.js` | Telegram Mini App UI and client logic |
| `web/assets/` | Embedded visual assets (original JPEGs) |
| `scripts/build.mjs` | Deterministically generates `dist/worker.mjs` from the modular source |
| `dist/worker.mjs` | Snapshot of the v56 Worker deployed on Cloudflare |
| `tests/` | Parser regression and bundle-consistency tests |
| `wrangler.example.jsonc` | Deployment configuration template, without credentials or account-specific resource IDs |

## Getting started

Requires Node.js 20+.

```bash
npm test
npm run build
```

Copy `wrangler.example.jsonc` to `wrangler.jsonc` and set your own Cloudflare bindings, D1 database ID, public Worker URL and branding values. For the existing production deployment, ensure the names and bindings match its settings before deployment.

Provision the following **secrets in Cloudflare**, not in Git:

- `BOT_TOKEN`
- `WEBHOOK_SECRET`
- `DESTINATION_CHAT_ID`
- `ADMIN_TELEGRAM_USER_ID`

Other live bindings: `DB` (D1), `AI` (Workers AI), `IMAGES` (Cloudflare Images). Plain-text configuration values include `BRAND_NAME`, `BRAND_HANDLE`, `BRAND_WEBSITE` and `PUBLIC_URL`.

Once the bindings and database schema have been verified against production:

```bash
npx wrangler deploy --config wrangler.jsonc
```

**Do not deploy before checking configuration:** the production database, Telegram webhook and channel are external resources; publishing this code does not migrate or back up their data.

## Signal parsing

Signals support both single entries and ranges, for example:

```text
GOLD SIGNAL | XAUUSD
BUY NOW
Entry Zone: 4075 – 4079
TP1: 4085
TP2: 4090
TP3: 4100
STOP LOSS: 4065
```

The parser checks side/symbol, entry, SL and at least one TP, and rejects levels that contradict the trade direction. For entry zones, its internal representative entry is the midpoint; the original range is preserved for rendering. The displayed risk/reward is therefore based on that midpoint, not guaranteed for every execution price.

## Data and security

This repository includes **source code and bundled static files only**. It does not contain the live D1 database, messages, Telegram bot tokens, deployment secrets or user credentials. The repository was public when this code was imported; review every proposed change before publication. This snapshot is **not** a live database backup.

The first imported version intentionally preserves the deployed Worker logic. Refactor only with parser, UI and delivery regression tests, and keep the generated `dist/worker.mjs` in sync with the source.
