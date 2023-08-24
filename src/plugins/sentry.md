

# Use Sentry fork
https://github.com/denysoblohin-okta/sentry-javascript/pull/1

Justification:
1) Need to preprocess network request/response body (filter sensitive data) captured by Session Replay.
   Solution: Added `filterNetwork` callback
2) Need ability to not send data to Sentry automatically, but only if user gives consent.
   Solution: Using offline transport with `fullOffline: true`


```shell
cd <sentry>
yarn
yarn build
cd packages/core
yarn build
yarn link
cd ../../packages/replay
yarn build
yarn link
cd ../../packages/browser
yarn build
yarn link

cd <siw>
yarn link @sentry/browser
yarn link @sentry/core
yarn link @sentry/replay
ENTRY=sentry TARGET=CROSS_BROWSER yarn build:webpack-dev
```

# Env
```
SENTRY_ORG=your Sentry org slug
SENTRY_PROJECT=your Sentry project slug
SENTRY_DSN= get at https://{SENTRY_ORG}.sentry.io/settings/projects/{SENTRY_PROJECT}/keys/
SENTRY_AUTH_TOKEN=your Sentry auth token, get at https://{SENTRY_ORG}.sentry.io/settings/auth-tokens/
SENTRY_REPORT_URI=get at https://{SENTRY_ORG}.sentry.io/settings/projects/{SENTRY_PROJECT}/security-headers/
SENTRY_KEY=value of `sentry_key` url param in SENTRY_REPORT_URI
```

# Test app Gen2
```sh
TARGET=CROSS_BROWSER yarn build:webpack-dev
DISABLE_CSP=1 TARGET=CROSS_BROWSER yarn start:test:app
```

For IE 11:
```sh
# https://ngrok.com/download
ngrok http --host-header=rewrite 3000
# or
npm install -g localtunnel
lt --port 3000 --local-host localhost
```
And open `https://xxx.ngrok-free.app` in Windows virtual machine.

In test app click 'Use Sentry' (and 'Use polyfill' for IE 11)

# Playground Gen3
Sentry is used by default.  
```sh
ENTRY=sentry TARGET=CROSS_BROWSER yarn build:webpack-dev
OKTA_SIW_HOST=0.0.0.0 DISABLE_CSP=1 OMIT_MSWJS=1 TARGET=CROSS_BROWSER yarn workspace v3 dev
```
Change `baseUrl` in `.widgetrc.js` to `https://xxx.ngrok-free.app` for IE 11.

# Playground Gen2
If you want to run it in IE 11, please manually add to `playground/index.html` (before other scripts):
```html
    <script src="/js/okta-sign-in.polyfill.js"></script>
```
Also change `baseUrl` in `.widgetrc.js` to `https://xxx.ngrok-free.app` for IE 11.  
Run:
```sh
OKTA_SIW_HOST=0.0.0.0 DISABLE_CSP=1 OMIT_MSWJS=1 TARGET=CROSS_BROWSER yarn start --watch
```

# How it works
Sentry collects information about user actions, DOM changes, network requests, but doesn't send automatically to backend.  
Instead it saves events to offline storage (IndexedDB).  
If error occurs, value of `sentry-has-error` item in local storage become > 0 (in `src/plugins/OktaPluginSentry.ts`).  
On next widget load, user will be asked to send captured events with error to Sentry. Queue in IndexedDB will be flushed.  

# Known issues
- See [CSP](#csp)
- Some errors are caught with try-catch blocks and can't be captured by Sentry without some code changes:
  - v1: see catch block in `render()` in `src/v1/BaseLoginRouter.js` - errors from controller render/preRender method (like https://github.com/okta/okta-signin-widget/pull/3276) can be caught if we pass error to `callGlobalError`, otherwise errors are suppressed
  - v3: see `src/v3/src/hooks/useOnSubmit` - `handleError` method is called from catch block and triggers `afterError` event. To be able to capture error with stacktrace, added original error object to `EventErrorContext`. In playground inside `afterError` hook added `captureWidgetError()` to manually send error to Sentry. This should be revisited as `afterError` event is not the best place to catch errors.
  - v3: see `src/v3/src/components/Widget` - `handleError` method is called from catch block and suppress error. Added `globalErrorFn` call

# CSP
Sentry uses fork of `rrweb` for Session Replay.  
Fork: https://github.com/getsentry/rrweb/  
CSP issue: https://github.com/rrweb-io/rrweb/issues/816  
PR to fix it in original repo: https://github.com/rrweb-io/rrweb/pull/846  
Already merged in fork.  
But waiting for release (next after 1.108.0).  

# Safe fields
https://{SENTRY_ORG}.sentry.io/settings/projects/{SENTRY_PROJECT}/security-and-privacy/
Safe fields in project config:
- currentAuthenticator
- currentAuthenticatorEnrollment
- errorCauses
- errorSummary
- currentFormName
- formName
- configuredFlow
- contextData
- errorContextData
- authenticatorKey
- controller
