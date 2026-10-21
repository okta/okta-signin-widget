# Running the "Send feedback" → Sentry demo locally

A local-dev harness for exercising the gen3 user-feedback feature end-to-end
without okta-core. See the full design in
[`sentry-user-feedback-design.md`](./sentry-user-feedback-design.md).

## How it fits together

The widget does **not** bundle or initialize a Sentry SDK. It consumes a global
`window.Sentry` published by a Sentry *wrapper*. In production that is
`@okta/sentry-wrapper`; locally, the playground ships a stand-in:

| Piece | File |
|---|---|
| Local wrapper (inits SDK, Session Replay in buffer mode, publishes `window.Sentry`) | `playground/sentry-wrapper.ts` → built as `js/sentry-wrapper.js` |
| Load-order wiring + `window.okta.sentry` config | `playground/index.html` |
| Separate webpack entry for the wrapper bundle | `src/v3/webpack.dev.config.ts` |
| Widget sender (flush replay, `captureUserFeedback`, tags) | `src/v3/src/util/sentryFeedback.ts` |
| Entry point hook (invokable from any view) | `src/v3/src/hooks/useSendFeedback.ts` |
| Widget option | `WidgetOptions.feedback` in `src/v3/src/types/widget.ts` |
| Demo mock flows | `playground/mocks/config/test-configs/FeedbackDemo.js` |

`index.html` loads scripts in the order `runtime.js → sentry-wrapper.js →
okta-sign-in.js`, so the wrapper inits and publishes `window.Sentry` **before**
the widget bootstraps. The wrapper calls `Replay.startBuffering()` at page load,
so its fetch instrumentation is installed before okta-auth-js binds fetch and the
IDX calls are captured into an in-memory buffer. Nothing uploads until the user
clicks "Send feedback".

## Steps

1. **Provide a Sentry DSN.** Use a dev/test Sentry project. Either:
   - paste it into `window.okta.sentry.sentryDsn` in `playground/index.html`, or
   - pass it at runtime (no rebuild): `http://localhost:3000/?sentryDsn=https://<key>@oXXX.ingest.sentry.io/<project>`

2. **Enable the feature** in `.widgetrc.js` (copy from `.widgetrc.sample.js`):
   ```js
   feedback: { enabled: true, optOut: false },
   ```

3. **Pick a demo mock** (optional). In `playground/mocks/config/responseConfig.js`,
   comment out `mocks: idx` and uncomment one `Test.FeedbackDemo.*` line — e.g.
   `identifyThenTerminalMock` for a short flow then a view to send from.

4. **Run gen3:**
   ```bash
   OKTA_SIW_GEN3=true yarn start
   ```

5. **Exercise it.** Progress through the flow, trigger "Send feedback" (+ optional
   comment), then look in your Sentry project under **User Feedback** — the entry
   links to an event carrying the fixed tag set (`engine`, `siwVersion`, `flow`,
   `formName`, `factor`, `hasReplay`) and, when Replay flushed, a linked session
   replay. Confirm `sentry_source: playground-wrapper` to verify it arrived via
   the global/wrapper path.

## Notes

- If `window.Sentry` is absent (wrapper didn't load / no DSN), the sender
  hard-fails with a loud `console.error` — by design, so a missing wrapper is
  caught, never silently masked.
- Replay is masked (`maskAllText`/`maskAllInputs`/`blockAllMedia`) and in buffer
  mode (`replaysSessionSampleRate: 0` / `replaysOnErrorSampleRate: 0`). Sensitive
  fields in captured IDX bodies are redacted by Sentry org + project
  data-scrubbing on ingest — see the design doc §3.2.
- Full-page redirects (social IdP, SAML POST) reset the in-memory buffer; the
  replay then covers only from the post-redirect page load. See design doc §8.
