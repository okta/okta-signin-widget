# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build
```bash
yarn build:dev          # Development build (webpack)
yarn build:release      # Production build (webpack)
yarn build:esm          # ES modules build (rollup)
yarn build:types        # Generate TypeScript definitions
yarn start              # Start dev server on localhost:3000
```

### Lint
```bash
yarn lint               # Run all linters (eslint + stylelint) in parallel
yarn lint:eslint        # ESLint on TS/JS files
yarn lint:stylelint     # StyleLint on SASS files
yarn lint:types         # Lint TypeScript definitions
```

### Test
```bash
# Unit tests (Jest)
yarn test -t jest                    # Run all unit tests
yarn jest test/unit/spec/path/to/test.js   # Run a single test file
yarn jest --testNamePattern="pattern"      # Run tests matching a name pattern

# E2E tests (TestCafe) — requires dev server running
yarn test:testcafe-setup             # Start dev server (terminal 1)
yarn test -t testcafe                # Run all e2e tests (terminal 2)
yarn test -t testcafe --fixture "FixtureName"  # Run specific fixture

# TypeScript definition tests
yarn test:tsd
```

Unit tests live in `test/unit/spec/` and mirror the `src/` directory structure. Jest config is `jest.config.js`.

### Gen3 / v3 (run from `src/v3/`)
```bash
# Build
yarn build:dev                       # Dev build (webpack)
yarn build:release                   # Production build (webpack)

# Dev server
yarn dev                             # Start webpack-dev-server with HMR

# Lint
yarn lint                            # ESLint on v3 source
yarn lint:styles                     # StyleLint on v3 SCSS/CSS

# Unit tests (Jest via ts-jest)
yarn test                            # Run all v3 unit tests
yarn test -- --testPathPattern="path/to/test"  # Run a specific test file
yarn test -- --testNamePattern="pattern"       # Run tests matching a name pattern

# E2E tests (TestCafe)
yarn test:e2e                        # Run v3 e2e tests

# Run a single parity fixture:
yarn test:parity-setup               # Terminal 1
OKTA_SIW_GEN3=true yarn testcafe --fixture "FixtureName"  # Terminal 2

# Visual regression tests
yarn test:vrt                        # Run VRT (headless Chrome)
yarn test:vrt-update-screenshots     # Update VRT baseline screenshots
```

v3 unit tests live alongside source files as `*.test.ts(x)`. Jest config is `src/v3/jest.config.js`.

## Architecture

The widget is a multi-engine authentication UI with three parallel implementations:

### Engines
- **v1 (Classic Engine)** — `src/v1/`: Original Backbone.js MVC implementation. Controllers, models, views, and utility modules. Used for legacy Okta orgs.
- **v2 (OIE/Identity Engine)** — `src/v2/`: Modern identity platform built on Backbone.js with an "ion" protocol layer. Includes a `view-builder/` that dynamically constructs forms from IDX API responses.
- **v3 (Gen3)** — `src/v3/`: Next-generation React-based implementation developed in parallel.

### Entry Points and Exports
- `src/widget/` — Main widget class that bootstraps the appropriate engine
- `src/exports/` — Bundle entry points: `default`, `classic`, `oie`, and `cdn` variants
- `src/router/` — URL routing shared across engines
- Build outputs in `target/js/`: `okta-sign-in.js`, `okta-sign-in.classic.js`, `okta-sign-in.oie.js`, `okta-sign-in.polyfill.js`

### Build System
- **Webpack** (`webpack.*.config.js`): Primary bundler producing UMD bundles in `target/js/` and CSS in `target/css/`
- **Rollup** (`rollup.*.config.js`): Produces ES modules in `target/esm/`
- **Grunt** (`Gruntfile.js`): Asset compilation and miscellaneous tasks
- **Babel** (`babel.config.js`): Transpiles TypeScript, handles Handlebars inline precompile, AMD→CJS transforms, and path aliases

### Local Packages (Workspaces)
Under `packages/`:
- `@okta/courage-dist` — Internal UI component library (Backbone widgets, form controls)
- `@okta/i18n` — Internationalization bundles (50+ languages)
- `@okta/qtip2` — Tooltip library

### Key Globals and Aliases
Babel and webpack both resolve `@okta/*` package aliases (see `babel.config.js` `module-resolver` and `webpack.common.config.js` `resolve.alias`). Internal utilities are aliased as `util/`, `models/`, etc.

### Templates
Views use Handlebars templates (`.hbs` files). The `@okta/babel-plugin-handlebars-inline-precompile` plugin precompiles them at build time.

### Styling
SASS source in `assets/sass/`, compiled to `target/css/`. StyleLint enforces CSS conventions.

### Testing Infrastructure
- **Jest** with `babel-jest` transformer; test timeout 20s (200s in DEBUG mode); coverage thresholds ~70-73%
- **TestCafe** for browser E2E with Chrome/headless; supports mobile emulation (iPhone X); uses request mocks for OAuth/SSO endpoints
- **TSD** for TypeScript definition correctness tests in `test/types/`
- `OKTA_SIW_SKIP_FLAKY=true` skips known flaky tests in CI
