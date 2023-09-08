# Create Sentry project
1. Create account at https://sentry.io
2. Click 'Install Sentry'. Select 'Browser Javascript', click 'Configure SDK', click 'Skip', click 'Skip onboarding'
3. In dashboard in left panel select 'Projects'. There should be default 'javascript' project. Open its settings.
4. At 'SDK Setup -> Client keys (DSN)' (page `https://{SENTRY_ORG}.sentry.io/settings/projects/{SENTRY_PROJECT}/keys/`) you can get your `SENTRY_DSN`
5. At your org settings at 'Developer settings -> Auth Tokens' (page `https://{SENTRY_ORG}.sentry.io/settings/auth-tokens/`) please add new auth token, it's your `SENTRY_AUTH_TOKEN`
6. At project settings in 'Processing -> Security & Privacy -> Safe Fields' (page `https://{SENTRY_ORG}.sentry.io/settings/projects/{SENTRY_PROJECT}/security-and-privacy/`) you can set safe fields in events that should not be masked. See [Safe fields](#safe-fields). Doc: https://docs.sentry.io/product/data-management-settings/scrubbing/server-side-scrubbing/

# Env
Add to your `testenv`:
```
SENTRY_ORG=your Sentry org slug
SENTRY_PROJECT=your Sentry project slug
SENTRY_DSN= get at https://{SENTRY_ORG}.sentry.io/settings/projects/{SENTRY_PROJECT}/keys/
SENTRY_AUTH_TOKEN=your Sentry auth token, get at https://{SENTRY_ORG}.sentry.io/settings/auth-tokens/
SENTRY_REPORT_URI=get at https://{SENTRY_ORG}.sentry.io/settings/projects/{SENTRY_PROJECT}/security-headers/
SENTRY_KEY=value of `sentry_key` url param in SENTRY_REPORT_URI
```

# Use Sentry fork
https://github.com/denysoblohin-okta/sentry-javascript/pull/1

Justification of fork:
1) Need to preprocess network request/response body (filter sensitive data) captured by Session Replay.
   Solution: Added `filterNetwork` callback
2) Need an ability to not send events to Sentry automatically (which is done by default), but only if user gives consent (after page reload, if error occured).
   Solution: Using offline transport with `fullOffline: true`

Please checkout fork and run:
```shell
cd <sentry-javascript>
yarn
yarn build
cd packages/core
yarn build
yarn link
cd ../../packages/replay-worker
yarn build
#yarn link
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
#yarn link @sentry/replay-worker
```

# Build
Run to build `okta-sign-in.sentry.js` (after linking to the Sentry fork):
```sh
ENTRY=sentry TARGET=CROSS_BROWSER yarn build:webpack-dev # or webpack-release
```
To enable Sentry for playground app, please manually add to `playground/index.html` (before other scripts):
```html
    <script src="/js/okta-sign-in.sentry.js"></script>
```
Then run playground or test app.


# Run

## Run playground Gen3
Run:
```sh
OKTA_SIW_HOST=0.0.0.0 DISABLE_CSP=1 TARGET=CROSS_BROWSER yarn workspace v3 dev
```

## Run playground Gen3 release
In `playground/index.html`:
- change `/css/okta-sign-in.css` to `/css/okta-sign-in.next.css`
- change `/js/okta-sign-in.js` to `/js/okta-sign-in.next.js`
Run:
```sh
TARGET=CROSS_BROWSER yarn workspace v3 build:release
OKTA_SIW_HOST=0.0.0.0 DISABLE_CSP=1 TARGET=CROSS_BROWSER npx webpack-dev-server --config webpack.playground.config.js
```

## Run playground Gen1/2
If you want to run it on IE 11, please manually add to `playground/index.html` (before other scripts):
```html
    <script src="/js/okta-sign-in.polyfill.js"></script>
```
Run:
```sh
OKTA_SIW_HOST=0.0.0.0 DISABLE_CSP=1 OMIT_MSWJS=true TARGET=CROSS_BROWSER yarn start --watch
```

## Run test app Gen1/2
Run:
```sh
TARGET=CROSS_BROWSER yarn build:webpack-dev # or webpack-release
DISABLE_CSP=1 TARGET=CROSS_BROWSER yarn start:test:app
```

In test app click 'Use Sentry' (and 'Use polyfill' for IE 11)

## IE 11
For IE 11:
- Run webpack dev server at Mac machine, use Windows virtual machine with IE 11 (or IE Edge with IE 11 compat mode)
- Use ngrok or localtunnel to expose localhost to VM:
```sh
# https://ngrok.com/download
ngrok http --host-header=rewrite 3000
# or
npm install -g localtunnel
lt --port 3000 --local-host localhost
```
- Change `baseUrl` in `.widgetrc.js` to `https://xxx.ngrok-free.app`
- Open `https://xxx.ngrok-free.app` in IE 11 in Windows virtual machine.



# How to test
Uncomment
```js
//throw new Error('(for sentry) test error .....`);
```
Error should be caught by Sentry. On next widget load, user should be prompted with question "Send last error to Sentry?".  
If you click "Yes", you should see new issue in Sentry dashboard with a Session Replay.

# How it works
Sentry collects information about user actions, DOM changes, network requests, but should not send automatically to backend (requirement of Security Team).  
Instead it should save events to offline storage (IndexedDB).  
If error occurs, value of `sentry-has-error` item in local storage become > 0 (in `src/plugins/OktaPluginSentry.ts`).  
On next widget load, user will be asked to send captured events with error to Sentry. Queue in IndexedDB will be flushed. (And while it's flushing to Sentry backend, new events can be pushed to queue and should not be sent!)

# Known issues
- See [CSP](#csp)
- Some errors are caught with try-catch blocks in SIW code and can't be captured by Sentry without some code changes:
  - v1: see catch block in `render()` in `src/v1/BaseLoginRouter.js` - errors from controller render/preRender method (like https://github.com/okta/okta-signin-widget/pull/3276) can be caught if we pass error to `callGlobalError`, otherwise errors are suppressed
  - v3: see `src/v3/src/hooks/useOnSubmit` - `handleError` method is called from catch block and triggers `afterError` event. To be able to capture error with stacktrace, added original error object to `EventErrorContext`. In playground inside `afterError` hook added `captureWidgetError()` to manually send error to Sentry. This should be revisited as `afterError` event is not the best place to catch errors.
  - v3: see `src/v3/src/components/Widget` - `handleError` method is called from catch block and suppress error. Added `globalErrorFn` call

# CSP
Sentry uses fork of `rrweb` for Session Replay.  
Fork: https://github.com/getsentry/rrweb/  
NPM: https://www.npmjs.com/package/@sentry-internal/rrweb  (currently latest is 1.108.0)  
CSP issue: https://github.com/rrweb-io/rrweb/issues/816  
PR to fix it in original repo: https://github.com/rrweb-io/rrweb/pull/846  
Already merged in fork.  
But waiting for release (next after 1.108.0).  
Until update, `DISABLE_CSP=1` should be used.

# Safe fields
https://{SENTRY_ORG}.sentry.io/settings/projects/{SENTRY_PROJECT}/security-and-privacy/
Safe fields in project config, to prevent agressive meta data scrubbing:
```
currentAuthenticator
currentAuthenticatorEnrollment
errorCauses
errorSummary
currentFormName
formName
configuredFlow
contextData
errorContextData
authenticatorKey
controller
```
