const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

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

function registerServices(app, mocksPath = []) {
  /* eslint max-depth: [2, 4] */
  const entries = fs.readdirSync(path.resolve(configDir, ...mocksPath), {
    withFileTypes: true,
  });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      registerServices(app, [...mocksPath, entry.name]);
    } else if (entry.isFile()) {
      const ext = entry.name.split('.').pop().toLowerCase();
      if (['js', 'ts'].includes(ext)) {
        let configs = require(path.resolve(configDir, ...mocksPath, entry.name));
        if (!Array.isArray(configs)) {
          configs = [configs];
        }
        for (const config of configs) {
          registerService(app, config);
        }
      }
    }
  }
}

function registerService(app, config) {
  console.log(`Registering ${config.method} service at ${config.path}`);
  const method = config.method.toLowerCase();
  app[method](config.path, async (req, res) => {
    // Delay
    if (config.delay) {
      await sleep(Array.isArray(config.delay) ? getRandomDelay(config.delay) : config.delay);
    }
    // Render
    if (config.template) {
      const resp = typeof config.template === 'function' ? config.template(req.params, req.query) : config.template;
      res.send(resp);
    } else if (typeof config.render === 'function') {
      config.render(req, res);
    }
    // Status
    if (config.status) {
      if (typeof config.status === 'function') {
        config.status(req, res, () => {});
      } else {
        res.status(config.status);
      }
    }
    res.end();
  });
  if (method !== 'options') {
    app.options(config.path, cors({ origin: true, credentials: true }));
  }
}


const app = express();
app.use(cors({ origin: true, credentials: true }));
registerServices(app);
app.all('*', (req, res) => {
  console.warn(`404 NOT FOUND: ${req.url}`);
  res.writeHead(404);
  res.end();
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('\x1b[32m%s\x1b[0m', 'Mock server started at port:', port);
});
