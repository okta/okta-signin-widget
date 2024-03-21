module.exports = {
  extends: ['plugin:compat/recommended'],
  env: {
    browser: true
  },
  settings: {
    polyfills: [
      'DOMQuad',
      'navigator.credentials',
      // API availability is checked at runtime
      'AbortController',
      // API availability is checked at runtime by 'broadcast-channel', this polyfill should be removed in v7
      'BroadcastChannel',
      // API availability is checked at runtime by 'broadcast-channel', intoduced in bc@5.x via auth-js@7.5
      'navigator.locks',
      // No polyfill exist in CDN bundle for this API
      // Use [text-encoding](https://github.com/inexorabletash/text-encoding) as the polyfill when needed
      'TextEncoder',
      // Polyfill is added by "core-js/stable" in build stage
      'URL.username',
      'URL.host',
      'URL.hash',
      'URLSearchParams.get',
    ],
  }
};
