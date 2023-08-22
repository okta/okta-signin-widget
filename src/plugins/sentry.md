

# Use Sentry fork
https://github.com/denysoblohin-okta/sentry-javascript/pull/1
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
OKTA_SIW_HOST=0.0.0.0 DISABLE_CSP=1 OMIT_MSWJS=1 TARGET=CROSS_BROWSER yarn workspace v3 dev
```
Change `baseUrl` in `.widgetrc.js` to `https://xxx.ngrok-free.app` for IE 11.

# Issues
- See [CSP](#csp)
- IE 11: network responses in session replay have no bodies

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
