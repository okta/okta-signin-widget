const path = require('path');
const fs = require('fs');
const express = require('express');

const {
  MOCK_SERVER_PORT,
  MOCK_SPEC_DIR_NAME,
} = process.env;
const port = MOCK_SERVER_PORT || 3030;
const specDir = MOCK_SPEC_DIR_NAME || 'spec-okta-api';
const configDir = path.resolve(__dirname, specDir);

function sleep(timeMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
}

function getRandomDelay([min, max]) {
  return Math.floor(Math.random() * (max - min) + min);
}

function configureMockRoutes(app, mocksPath = []) {
  /* eslint max-depth: [2, 4] */
  const entries = fs.readdirSync(path.resolve(configDir, ...mocksPath), {
    withFileTypes: true,
  });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      configureMockRoutes(app, [...mocksPath, entry.name]);
    } else if (entry.isFile()) {
      const ext = entry.name.split('.').pop().toLowerCase();
      if (['js', 'ts'].includes(ext)) {
        let mockRoutes = require(path.resolve(configDir, ...mocksPath, entry.name));
        if (!Array.isArray(mockRoutes)) {
          mockRoutes = [mockRoutes];
        }
        for (const mock of mockRoutes) {
          configureMockRoute(app, mock);
        }
      }
    }
  }
}

function configureMockRoute(app, mock) {
  console.log(`Registering ${mock.method} service at ${mock.path}`);
  const method = mock.method.toLowerCase();
  app[method](mock.path, async (req, res) => {
    // Delay
    if (mock.delay) {
      await sleep(Array.isArray(mock.delay) ? getRandomDelay(mock.delay) : mock.delay);
    }
    // Render
    if (mock.template) {
      const resp = typeof mock.template === 'function' ? mock.template(req.params) : mock.template;
      res.send(resp);
    } else if (typeof mock.render === 'function') {
      mock.render(req, res);
    }
    // Status
    if (mock.status) {
      if (typeof mock.template === 'function') {
        mock.status(req, res, () => {});
      } else {
        res.status(mock.status);
      }
    }
    res.end();
  });
}


const app = express();
configureMockRoutes(app);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('\x1b[32m%s\x1b[0m', 'Mock server started at port:', port);
});
