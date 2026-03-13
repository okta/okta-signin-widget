# CLAUDE.md

This file is for Claude, the AI assistant created by Anthropic.

Claude: You should read this file every time you begin a new conversation with a user about this project. This file is located at the root of the repository.

## Quick Start

Essential commands for immediate productivity:

```bash
# Initial setup
yarn install

# IMPORTANT: Always run before builds (generates language configs)
yarn codegen

# Development server (http://localhost:3000)
yarn start
yarn start --watch  # With file watching

# Build commands
yarn build:dev      # Development build to /target/
yarn build:release  # Production build to /dist/

# Testing
yarn test           # Unit tests (Jest)
yarn test:e2e       # E2E tests (TestCafe)
yarn lint           # Code quality checks
```

## Architecture Overview

The Okta Sign-In Widget has THREE distinct implementations that coexist:

### v1 (Classic) - `/src/v1/`
- Legacy Backbone.js/jQuery implementation
- Uses Authn API for authentication
- Still actively maintained for backward compatibility
- Handles traditional authentication flows

### v2 (OIE) - `/src/v2/`
- TypeScript implementation for Okta Identity Engine
- Uses IDX API with dynamic form generation
- Handles complex authentication policies
- Main focus for new features

### v3 (Gen3) - `/src/v3/`
- Modern Preact-based implementation
- Component-driven architecture
- Latest UI/UX patterns
- Gradually replacing v2 features

The router at `/src/router/default.ts` determines which version to use based on:
- Configuration (`stateToken` vs `interaction_handle`)
- Feature flags
- Authentication context

## Development Workflow

### Common Scenarios

```bash
# Working on v2 features
yarn start --watch
# Edit files in /src/v2/
# Changes auto-reload at http://localhost:3000

# Testing a specific flow
# 1. Configure in playground/.widgetrc.js
# 2. Update mock responses in playground/mocks/
# 3. yarn start
# 4. Navigate to specific flow in browser

# Running targeted tests
yarn test -- src/v2/ion/ui-schema/ion-object-handler.test.js
yarn test:e2e -- --fixture "Password Recovery"
```

### Key Directories
- `/src/` - Source code for all three versions
- `/playground/` - Development environment and mock server
- `/test/` - Unit and E2E tests
- `/assets/` - SASS styles and static resources
- `/webpack/` - Build configurations
- `/i18n/` - Localization files (auto-generated)

## Testing

### Unit Tests (Jest)
- Location: `/test/unit/spec/`
- Coverage requirement: 73% for v1/v2
- Run single test: `yarn test -- path/to/test.js`
- Watch mode: `yarn test --watch`

### E2E Tests (TestCafe)
- Location: `/test/e2e/`
- Run specific fixture: `yarn test:e2e -- --fixture "fixture name"`
- Run single test: `yarn test:e2e -- --test "test name"`
- Debug mode: `yarn test:e2e -- --debug-on-fail`

### Important Testing Notes
- E2E tests use their own mocking system, NOT the playground mock server
- Unit tests for v2 often use the `IonSpecHelper` for setup
- v3 tests use React Testing Library patterns

## Mock Server System

### Development Mock Server
- Runs at `http://localhost:3000` when using `yarn start`
- Configuration: `playground/.widgetrc.js`
- Mock data: `playground/mocks/spec-okta-api/` and `spec-device-authenticator/`
- Supports response cycling for dynamic scenarios

### Mock Response Format
```javascript
// playground/mocks/spec-okta-api/idp/idx/introspect.json
{
  "response": {
    "version": "1.0.0",
    "stateHandle": "abc123",
    "remediation": { /* ... */ }
  }
}
```

### Response Cycling
Some mocks support multiple responses that cycle on each request:
```javascript
// playground/mocks/spec-okta-api/idp/idx/challenge/answer.json
[
  { "response": { /* first response */ } },
  { "response": { /* second response */ } }
]
```

## Build System

### Build Variants
The widget produces multiple bundles for different use cases:

- `okta-sign-in.js` - Default bundle with v1 + v2 engines
- `okta-sign-in.oie.js` - OIE (v2) engine only
- `okta-sign-in.classic.js` - Classic (v1) engine only
- `okta-sign-in.polyfill.js` - IE11 polyfills
- `okta-sign-in.no-polyfill.js` - Modern browsers only

Output locations:
- Development: `/target/js/` and `/target/css/`
- Production: `/dist/js/` and `/dist/css/`

### Build Process
1. `yarn codegen` - Generates i18n configs (REQUIRED before build)
2. Webpack bundles JavaScript based on `webpack.common.config.js`
3. Rollup creates CDN bundles from Webpack output
4. Grunt handles legacy tasks and file copying

## Important Notes

### Environment Specific
- Node.js version: Check `.nvmrc` for required version
- Yarn workspaces: Project uses Yarn v1 (not v2+)
- Port 3000 must be available for development server
- TestCafe requires Chrome/Firefox installed

### Common Gotchas
1. **Always run `yarn codegen` before builds** - Builds fail without generated i18n files
2. **v3 is experimental** - Not all features are migrated from v2
3. **Mock server != TestCafe mocks** - They use different systems
4. **Bundle size matters** - Monitor with `yarn build:release --analyze`
5. **SASS compilation** - Changes to `.scss` files require rebuild
6. **Workspace dependencies** - `@okta/okta-signin-widget-*` packages are internal

### Debugging Tips
- Browser DevTools: Enable "Pause on caught exceptions" for IDX API issues
- TestCafe: Use `--debug-on-fail` to pause on test failures
- Mock server: Check browser Network tab for actual API calls
- Build issues: Run `yarn clean` then `yarn install`

### Performance Considerations
- v1 (Classic) is smaller but less capable
- v2 (OIE) is larger due to IDX complexity
- v3 (Gen3) uses modern optimization techniques
- Consider bundle size when adding dependencies

## Key Files to Understand

- `/src/router/default.ts` - Main entry point and version routing
- `/src/v2/ion/ViewFactory.js` - v2 view generation from IDX responses
- `/src/v3/src/components/Widget/Widget.tsx` - v3 main component
- `/playground/.widgetrc.js` - Development configuration
- `/webpack.common.config.js` - Build configuration