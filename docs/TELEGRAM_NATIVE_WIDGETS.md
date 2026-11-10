DrFX Admin - Telegram 10.4 Native Widgets

Purpose: a private admin sends /review or /widgets and receives the latest pending item in a native Telegram HTML widget. The message displays a short preview, status, Reject, Approve & Publish, and Refresh. No new D1 schema is needed.

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
