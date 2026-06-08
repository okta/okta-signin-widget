// Serves the production-built widget bundle (target/js/) from playground HTML
// with the same mock-server proxy that webpack-dev-server uses for `yarn start`
// or `yarn workspace v3 dev`. Useful for reproducing customer issues against
// the artifact they actually load — minification, polyfill inlining, and
// release-mode babel transforms all match what Okta-hosted pages serve.
//
// Run `yarn build:release` first to populate target/.

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..', '..');
const TARGET = path.join(REPO, 'target');
const PLAYGROUND = path.join(REPO, 'playground');

// Per-engine bundle catalogue. Each entry maps a CLI variant name to:
//   file  — the artifact in target/js/
//   alias — the path (also under /js/) the playground HTML hard-codes;
//           when the requested variant isn't the engine's default, the
//           server aliases the alias path to the variant file so the HTML
//           doesn't need editing.
const ENGINES = {
  gen2: {
    indexHtml: 'cdn.html',
    cssFile: 'okta-sign-in.css',
    bundles: {
      default: { file: 'okta-sign-in.min.js', alias: '/js/okta-sign-in.min.js' },
      'no-polyfill': { file: 'okta-sign-in.no-polyfill.min.js', alias: '/js/okta-sign-in.min.js' },
      oie: { file: 'okta-sign-in.oie.min.js', alias: '/js/okta-sign-in.min.js' },
      classic: { file: 'okta-sign-in.classic.min.js', alias: '/js/okta-sign-in.min.js' },
    },
  },
  gen3: {
    indexHtml: 'cdn-next.html',
    cssFile: 'okta-sign-in.next.css',
    bundles: {
      default: { file: 'okta-sign-in.next.js', alias: '/js/okta-sign-in.next.js' },
      'no-polyfill': { file: 'okta-sign-in.next.no-polyfill.js', alias: '/js/okta-sign-in.next.js' },
    },
  },
};

const PROXY_PATHS = [
  '/oauth2',
  '/api/v1',
  '/idp/idx',
  '/login/getimage',
  '/sso/idps',
  '/app/UserHome',
  '/auth/services',
  '/.well-known/webfinger',
];

exports.command = 'start-prod';
exports.desc = 'Serve the production-built bundle from target/ with mock-server proxy (run after yarn build:release)';

exports.builder = {
  port: {
    description: 'Port for the static server',
    type: 'number',
    default: 3000,
  },
  'mock-port': {
    description: 'Port for the mock server',
    type: 'number',
    default: 3030,
  },
  'no-mock': {
    description: 'Disable the mock server (no API proxy — calls 404)',
    type: 'boolean',
    default: false,
  },
  engine: {
    description: 'Which widget engine to serve',
    choices: Object.keys(ENGINES),
    default: 'gen2',
  },
  bundle: {
    description: 'Bundle variant within the chosen engine (run --help-engine to list per-engine variants)',
    type: 'string',
    default: 'default',
  },
};

exports.handler = (argv) => {
  const express = require('express');
  const { createProxyMiddleware } = require('http-proxy-middleware');

  const engine = ENGINES[argv.engine];
  const variant = engine.bundles[argv.bundle];
  if (!variant) {
    // eslint-disable-next-line no-console
    console.error(
      `✗ Unknown bundle variant for engine ${argv.engine}: ${argv.bundle}\n` +
      `  Available variants for ${argv.engine}: ${Object.keys(engine.bundles).join(', ')}`
    );
    process.exit(1);
  }

  const bundlePath = path.join(TARGET, 'js', variant.file);
  if (!fs.existsSync(bundlePath)) {
    // eslint-disable-next-line no-console
    console.error(`✗ Bundle not found: ${bundlePath}\n  Run \`yarn build:release\` first.`);
    process.exit(1);
  }

  const app = express();

  if (!argv['no-mock']) {
    // Spawn the mock server via nodemon — same pattern webpack-dev-server uses.
    // Watching playground/mocks lets responseConfig.js / JSON edits hot-reload.
    const nodemon = require('nodemon');
    const widgetRc = require(path.join(REPO, '.widgetrc.js'));
    nodemon({
      script: path.join(PLAYGROUND, 'mocks/server.js'),
      watch: [path.join(PLAYGROUND, 'mocks')],
      env: {
        MOCK_SERVER_PORT: String(argv['mock-port']),
        DEV_SERVER_PORT: String(argv.port),
        BASE_URL: widgetRc.baseUrl,
      },
      delay: 50,
    }).on('crash', (err) => {
      // eslint-disable-next-line no-console
      console.error('Mock server crashed:', err);
    });

    const proxy = createProxyMiddleware({
      target: `http://localhost:${argv['mock-port']}`,
      changeOrigin: true,
    });
    PROXY_PATHS.forEach((p) => app.use(p, proxy));
  }

  // Variant alias must be registered BEFORE the static middleware so it
  // intercepts requests for the playground HTML's hard-coded bundle path.
  if (argv.bundle !== 'default') {
    app.get(variant.alias, (_req, res) => res.sendFile(bundlePath));
    app.get(`${variant.alias}.map`, (_req, res) => res.sendFile(`${bundlePath}.map`));
  }

  // Build artifact assets
  app.use('/js', express.static(path.join(TARGET, 'js')));
  app.use('/css', express.static(path.join(TARGET, 'css')));
  app.use('/font', express.static(path.join(TARGET, 'font')));
  app.use('/img', express.static(path.join(TARGET, 'img')));
  app.use('/labels', express.static(path.join(TARGET, 'labels')));

  app.get('/', (_req, res) => res.sendFile(path.join(PLAYGROUND, engine.indexHtml)));

  app.listen(argv.port, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log([
      `SIW prod-bundle server:  http://localhost:${argv.port}`,
      `Engine:                  ${argv.engine}`,
      `Bundle:                  ${variant.file}`,
      `Index HTML:              playground/${engine.indexHtml}`,
      `Mock server:             ${argv['no-mock'] ? 'disabled' : 'http://localhost:' + argv['mock-port']}`,
      argv['no-mock'] ? '' : 'Mock config:             playground/mocks/config/responseConfig.js (auto-restarts on edit)',
      '',
    ].filter(Boolean).join('\n'));
  });
};
