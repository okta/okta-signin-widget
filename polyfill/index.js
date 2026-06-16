/* eslint-disable @typescript-eslint/ban-ts-comment */

// core features
// `globalThis` must be polyfilled before any module that imports @okta/courage —
// handlebars 4.7.9's no-conflict module (bundled inside courage) ships an inline
// `globalThis` polyfill that throws TypeError on older WebKit (Safari ≤12.0,
// GlobalProtect's Linux embedded browser, certain WebView2 builds), aborting
// widget bootstrap. With this polyfill loaded first, handlebars's typeof check
// passes and its inline polyfill is skipped.
require('core-js/features/global-this');
require('core-js/features/object/set-prototype-of');
require('core-js/features/object/assign');
require('core-js/features/object/keys');
require('core-js/features/object/values');
require('core-js/features/object/from-entries');
require('core-js/features/object/entries');
require('core-js/features/object/iterate-entries');
require('core-js/features/object/iterate-keys');
require('core-js/features/object/iterate-values');
require('core-js/features/symbol/iterator');
require('core-js/es/promise');
require('core-js/es/typed-array/uint8-array');
require('core-js/features/array/from');
require('core-js/features/array/includes');
require('core-js/features/array/find');
require('core-js/features/array/find-index');
require('core-js/features/string/includes');
require('core-js/features/string/starts-with');
require('core-js/features/string/ends-with');
require('core-js/stable/set');
require('core-js/stable/weak-map');
require('core-js/web/url');

// crypto is needed for PKCE
require('fast-text-encoding'); // TextEncoder
require('webcrypto-shim'); // crypto.subtle
