
# Create Sentry project
...todo

# Use Sentry fork
...todo

Also see [CSP](#csp) issue

# Env
```
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_KEY=
SENTRY_REPORT_URI=
```
...todo

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

# Test app
```sh
cd test/app
DISABLE_CSP=1 IE_COMPAT=1 yarn start
```
Click 'Use Sentry' (and 'Use polyfill' for IE11)



# Playground
Not compatible with IE11

# CSP
Sentry uses fork of `rrweb` for Session Replay.  
Fork: https://github.com/getsentry/rrweb/  
CSP issue: https://github.com/rrweb-io/rrweb/issues/816  
PR to fix it in original repo: https://github.com/rrweb-io/rrweb/pull/846  
Already merged in fork.  
But waiting for release (next after 1.108.0).  
