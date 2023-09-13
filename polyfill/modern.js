/* eslint-disable @typescript-eslint/ban-ts-comment */

// include all core-js/stable
// webpack @babel/preset-env with useBuiltIns: 'entry' | 'usage'
// will replace this with only the polyfills required at build-time.
require('core-js/stable');

// crypto is needed for PKCE
require('fast-text-encoding'); // TextEncoder
require('webcrypto-shim'); // crypto.subtle
require('create-html-document-polyfill');
