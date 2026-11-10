DrFX Admin - Telegram 10.4 Native Widgets

Purpose: a private admin sends /review or /widgets and receives the latest pending item in a native Telegram HTML widget. To automatically respond with a native widget after a new eligible text/photo submission, configure DRFX_WIDGET_AUTOSEND_ENABLED=true in an isolated staging Worker first. This is disabled by default and falls back to the existing ordinary Telegram reply if sendWidget fails. Do not auto-send after uncertain publishing attempts. The message displays a short preview, status, Reject, Approve & Publish, and Refresh. No new D1 schema is needed.

Security:
- Private chats only; the webhook secret is verified before callbacks.
- Every widget_query checks the Telegram-authenticated sender, ADMIN_TELEGRAM_USER_ID, chat identity, and inbox row ownership.
- Draft text is passed as chat_data and assigned via textContent; it is never interpolated into HTML.
- Reject updates only a pending inbox item. Image publication remains in the existing Mini App approval workflow.
- Publication from widgets is disabled unless the Worker variable DRFX_WIDGET_PUBLISH_ENABLED is exactly true. This flag should stay unset until staging tests are approved.
- The existing publishRow transaction/recovery controller remains the only publication path.

Staging checklist:
1. Run npm test and npm run check:bundle.
2. Deploy an isolated Worker with test bot credentials. Register webhook updates message, callback_query, widget_query.
3. Send an admin text signal; send /review; inspect the widget on Android and desktop.
4. Verify Refresh, Reject, forbidden non-admin access, denied group access, and disabled Publish.
5. Test optional text-only publication against a staging channel after enabling the feature flag. Verify destination message ID and recovery behavior.
6. Review D1 usage and logs. Verify old Mini App and photo editing workflows remain functional.

Rollback: set DRFX_WIDGET_PUBLISH_ENABLED=false, then redeploy the previous Worker if needed. Do not change or drop production D1 tables.

Reference: https://core.telegram.org/bots/widgets

Production release notes (Nov 10, 2026):
- Both /review and /widgets are available in private admin chats. The command menu exposes both.
- DRFX_WIDGET_AUTOSEND_ENABLED=true allows safe automatic review widgets after new submissions; on Telegram rejection it falls back to the legacy message. No automatic publication is enabled by this flag.
- DRFX_WIDGET_PUBLISH_ENABLED remains false until a live bot and channel publish-confirmation exercise is completed. The admin can publish through the existing Mini App.
- The 5-minute cron checks getWebhookInfo and restores widget_query updates if the webhook changed, without storing secrets in logs.

## Hotfix · Widget review not responding (November 10, 2026)

- The **Review** primary button must open the Admin Mini App when `DRFX_WIDGET_PUBLISH_ENABLED=false`; publishing remains disabled. A separate **Status** button queries `drfx:status:<id>`, **Reject** queries `drfx:reject:<id>`.
- For `/review` and `/widgets`, `sendWidget` failures are caught and answered with a normal Telegram message containing an actual `web_app` inline keyboard. Auto widgets use the same safe sender.
- A successful widget includes an `Open Admin Mini App` inline keyboard even if the client cannot execute the embedded action.
- `widget_query` callbacks may omit `type` for a plain data request; reject *explicit* wallet/sign-data/transaction query types in this publishing endpoint.
- `/widgetstatus` is admin-only and shows webhook, commands, menu and last delivery, with no token or signal content.
- The 5-minute cron independently reconciles `getMyCommands` and `getChatMenuButton`, even when the webhook hash is unchanged. Telegram's correct menu method is `setChatMenuButton`.
- Once per hotfix release, cron attempts **one private non-trading diagnostic card**, clearly labeled as a test. The `widget_probe_release` marker prevents repeated sends; result is kept in `settings.widget_delivery_status`. Never perform a trade or publish to a channel in the probe.
- Before claiming mobile-client success, open a newly sent widget on an official client supporting Bot API 10.4; old messages retain their original HTML permanently.
- Commands to verify: `/widgetstatus`, `/review`, `/widgets`. Report errors from `/widgetstatus` without sharing any credential.
