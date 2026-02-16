# CLAUDE.md — Okta Sign-In Widget: Custom Factor Ordering Prototype

## Goal

This branch (`claude/okta-custom-factor-order-Fgij7`) adds a **custom authenticator/factor ordering** feature to the Okta Sign-In Widget. The objective is to allow a widget consumer to specify the order in which authentication factors are presented to the user during enrollment and verification flows, overriding the default order returned by the Okta IDX API.

Today, the authenticator list order is entirely determined by:
1. The IDX backend response (order of `options` in the remediation)
2. Hardcoded Okta Verify FastPass placement (based on `deviceKnown`)
3. Grace period segregation (enroll flow only)

There is **no existing widget configuration option** for custom factor ordering. This prototype adds one.

## Codebase Overview

This is the official **Okta Sign-In Widget** monorepo (v7.41.0). It is a large, mature codebase — the prototype work targets a narrow slice of it.

### Directory Structure (relevant portions)

```
src/
├── v2/                          # Backbone/Handlebars widget (legacy but still active)
│   ├── ion/
│   │   ├── ui-schema/
│   │   │   └── ion-object-handler.js   # Creates authenticator option UI schemas
│   │   ├── transformIdxResponse.js     # IDX response transform pipeline
│   │   └── i18nTransformer.js          # i18n label overrides
│   └── view-builder/
│       ├── components/
│       │   ├── AuthenticatorVerifyOptions.js   # Verify authenticator list view
│       │   └── AuthenticatorEnrollOptions.js   # Enroll authenticator list view
│       └── utils/AuthenticatorUtil.js          # Authenticator metadata (icons, labels)
│
├── v3/                          # React-based widget (modern, primary target)
│   └── src/
│       ├── transformer/
│       │   └── selectAuthenticator/
│       │       ├── utils.ts                                    # Core ordering logic
│       │       ├── transformSelectAuthenticatorVerify.ts        # Verify flow
│       │       ├── transformSelectAuthenticatorEnroll.ts        # Enroll flow
│       │       └── transformSelectAuthenticatorUnlockVerify.ts  # Unlock flow
│       ├── constants.ts         # AUTHENTICATOR_KEY enum, key maps
│       └── types.ts             # AuthenticatorButtonElement, ActionParams
│
├── models/Settings.ts           # Widget configuration model (where new option goes)
├── types/                       # Shared TypeScript types
├── exports/                     # Entry points (default, classic, oie)
└── widget/                      # OktaSignIn base class

playground/                      # Local dev server with mock API
test/unit/spec/                  # Jest unit tests
packages/                        # Internal @okta/* packages
```

### Key Files for This Feature

| Purpose | File |
|---------|------|
| **Widget config model** | `src/models/Settings.ts` |
| **V3 authenticator ordering** | `src/v3/src/transformer/selectAuthenticator/utils.ts` |
| **V3 verify flow** | `src/v3/src/transformer/selectAuthenticator/transformSelectAuthenticatorVerify.ts` |
| **V3 enroll flow** | `src/v3/src/transformer/selectAuthenticator/transformSelectAuthenticatorEnroll.ts` |
| **V2 authenticator options** | `src/v2/ion/ui-schema/ion-object-handler.js` |
| **Authenticator key constants** | `src/v3/src/constants.ts` |
| **Authenticator keys** | Values like `okta_password`, `okta_verify`, `phone_number`, `email`, `security_question`, `webauthn`, `google_otp`, `duo`, `custom_otp`, `custom_app`, etc. |

### How Authenticator Selection Works Today

1. The IDX API returns a remediation (e.g., `select-authenticator-authenticate`) containing an `authenticator` field with an `options` array.
2. Each option has a `label`, `value.form`, and `relatesTo` pointing to authenticator metadata.
3. **V3 path**: `getAuthenticatorButtonElements()` in `utils.ts` processes options into `AuthenticatorButtonElement[]`, then `reorderAuthenticatorButtons()` adjusts FastPass placement.
4. **V2 path**: `createAuthenticatorOptions()` in `ion-object-handler.js` maps options into UI schema objects.
5. The resulting list is rendered as-is — no consumer-configurable sorting exists.

## Development Workflow

### Prerequisites

- Node.js >= 14.18
- Yarn 1.x (`yarn` classic)

### Commands

```bash
# Install dependencies
yarn install

# Start dev server (playground with mock APIs)
yarn start

# Build (development)
yarn build:dev

# Build (release / production)
yarn build:release

# Run unit tests
yarn test

# Run linting
yarn lint

# Run specific test file
npx jest test/unit/spec/path/to/test.js
```

### Testing

- **Unit tests**: Jest, located in `test/unit/spec/`. Mirror the `src/` structure.
- **E2E tests**: TestCafe, located in `test/testcafe/`.
- **Type tests**: TSD, located in `test/types/`.
- Run all unit tests: `yarn test`
- Run a focused test: `npx jest --testPathPattern="<pattern>"`

### Build System

- **Bundlers**: Webpack (dev/release), Rollup (ESM output)
- **Transpilation**: Babel with TypeScript support
- **Task runner**: Grunt (orchestrates build steps)
- **Templating**: Handlebars (v2), React/JSX (v3)

## Key Conventions

### Authenticator Keys

Authenticators are identified by string keys defined in `AUTHENTICATOR_KEY` constants. Use these keys (not display names) for the ordering configuration:

- `okta_password`, `okta_verify`, `phone_number`, `email`
- `security_question`, `webauthn`, `google_otp`, `duo`
- `rsa_token`, `onprem_mfa`, `symantec_vip`, `yubikey_token`
- `custom_otp`, `custom_app`, `external_idp`, `smartcard`

### Configuration Pattern

Widget options are defined as Backbone model properties in `src/models/Settings.ts`. New options follow the pattern:

```ts
// In the `local` record:
optionName: ['type', required, defaultValue],
```

The widget is instantiated by consumers like:

```js
new OktaSignIn({
  baseUrl: 'https://your-org.okta.com',
  // ... other options
  authenticatorOrder: ['okta_password', 'email', 'phone_number', 'okta_verify'],
});
```

### Code Style

- 2-space indentation, LF line endings
- ESLint with `@okta/okta/courage-app` config
- TypeScript for new v3 code; JavaScript (ES6+) for v2 code
- Avoid introducing new dependencies when possible

## Implementation Strategy

The custom factor ordering feature should:

1. **Accept a new widget option** (e.g., `authenticatorOrder: string[]`) — an ordered array of authenticator keys.
2. **Sort the authenticator list** in both V3 and V2 pipelines before rendering, using the provided order. Authenticators not in the list should appear after the specified ones, preserving their original relative order.
3. **Respect existing constraints** — FastPass reordering and grace period segregation should still apply unless overridden by the custom order.
4. **Be testable** — unit tests should verify that the custom order is applied correctly and that unlisted authenticators fall through gracefully.
