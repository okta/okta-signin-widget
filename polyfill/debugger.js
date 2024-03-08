/* eslint-disable @typescript-eslint/ban-ts-comment */

// include all core-js/stable
// webpack @babel/preset-env with useBuiltIns: 'entry' | 'usage'
// will replace this with only the polyfills required at build-time.
require('core-js/stable');

require('cross-fetch/polyfill');
