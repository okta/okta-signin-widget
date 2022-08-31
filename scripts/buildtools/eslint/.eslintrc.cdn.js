module.exports = {
  root: true,
  extends: ["plugin:compat/recommended"],
  env: {
    browser: true
  },
  settings: {
    polyfills: [
      // 'TextEncoder',
      // 'BroadcastChannel',
      // 'AbortController',
      // 'navigator.credentials'
    ]
  }
};
