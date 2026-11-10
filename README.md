# DrFX Admin

Telegram signal republishing and content management Worker with an embedded Telegram Mini App. This repository is an **source of DrFX Admin v0.3.0 (originally imported from deployed Cloudflare Worker v56)** (2026-11-06), including the trading-signal parser update for ranged entries, Fast/Pro workspace, and Identity Intelligence.

## Repository layout

| Path | Description |
| --- | --- |
| `src/worker-runtime.mjs` | Worker application: Telegram webhook, signal parsing and validation, publishing, admin API, recovery and D1 integration |
| `web/index.html`, `web/app.js` | Telegram Mini App UI and client logic |
| `web/assets/` | Embedded visual assets (original JPEGs) |
| `scripts/build.mjs` | Deterministically generates `dist/worker.mjs` from the modular source |
| `dist/worker.mjs` | Generated deployable Worker bundle, subject to separate production rollout |
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


## Fast / Pro workspaces

- **Fast:** compact signal cards and a single-click action for **verified text signals only**. Failed delivery, ambiguous signals and photos go to the Pro review path.
- **Pro:** full content editing, image masking, OCR, AI assistance, risk fields, publishing recovery and identity inspection.
- **Identity Intelligence:** deterministic extraction of @handles, Telegram/social links, email addresses, phone numbers, domains and numeric account IDs in text. It preserves price levels and your configured brand identity.
- **Image scan:** the existing Cloudflare vision service proposes possible identity/logo regions for manual review. **Deep** mode adds more target searches and OCR for identity auditing; it may cost additional inference and can miss small or distorted text. Never treat a clean scan as proof that no identifier exists.

No new D1 tables are required. Advanced preferences are stored in the existing settings key/value table as \`identityGuard\` and \`scanDepth\`. Keep \`identityGuard\` enabled in production.

### Safe publishing
Fast never bypasses the Worker checks. Only one human click starts publication; database status locking, duplicate protection, direction/price validation, identity checks and delivery-recovery safeguards still apply. Photos must be explicitly reviewed and approved in the Pro image editor before publishing.

Run \`npm test\` before every Cloudflare deployment. The generated \`dist/worker.mjs\` is committed so its contents can be reviewed and reproduced; the build check compares it byte-for-byte with source inputs.

## v0.4.0 — Focused Channel Assistant

The administrator interface is intentionally limited to **three destinations**:

| Page | Purpose |
| --- | --- |
| **Home** | The latest actionable post, original detected trade levels, status, and **Edit / Preview / Publish** |
| **Inbox** | **Fast** (review-and-publish cards) or **Pro** (full text and image editing) |
| **Settings** | Brand identity and essential controls; image detection and security preferences in a collapsed advanced panel |

The interface uses a charcoal / muted gold palette. Green is reserved for successful or valid states; red is reserved for failed or dangerous states. The mobile navigation supports safe-area insets and reduced motion.

**No change to core publication permissions:** one-click publishing still uses the authenticated API, protects against duplicate posts, and validates active trade signals. Image publishing still requires a separately approved edited image. The **demo URL cannot publish messages**.

Run `npm test` to validate the combined Worker and the user-interface contracts; build with `npm run build`. No new D1 tables, secrets or Telegram bot configuration are required.
