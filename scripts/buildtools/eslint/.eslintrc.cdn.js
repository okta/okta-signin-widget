module.exports = {
  root: true,
  extends: ["plugin:compat/recommended"],
  env: {
    browser: true
  },
  settings: {
    // TODO: walk through list below to identify if polyfill should be added in build process
    // JIRA: https://oktainc.atlassian.net/browse/OKTA-529319
    polyfills: [
      'navigator.credentials',
      'AbortController',
      'BroadcastChannel',
      'TextEncoder',
      'URL.username',
      'URL.host',
      'URL.hash',
      'URLSearchParams.get',
    ],
  }
};
