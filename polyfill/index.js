/* eslint-disable @typescript-eslint/ban-ts-comment */

// core features
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
