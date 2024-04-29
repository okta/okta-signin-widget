// commonjs is required to use mock server from @okta/okta-signin-widget/mocks

const express = require('express');
const { createServer: createViteServer } = require('vite');
const spawn = require('cross-spawn-with-kill');
const { vite: viteConfig, mockServer } = require('./playground.config.cjs');

const PORT = viteConfig.server?.port || 3000;

async function createServer() {
  const app = express();

  if (process.env.NODE_ENV === 'preview') {
    app.use(express.static('dist'));
  } else {
    // Create Vite server in middleware mode
    const vite = await createViteServer(viteConfig);

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);
  }

  // Start mock server
  const path = require.resolve('@okta/okta-signin-widget/mocks');
  spawn('node', [path], {
    stdio: 'inherit',
    env: {
      ...(process.env || {}),
      MOCK_SERVER_PORT: mockServer.port,
      BASE_URL: `http://localhost:${PORT}`,
    }
  });

  app.listen(PORT, () => {
    console.info('playground dev server started at', PORT);
  });
}

createServer();
