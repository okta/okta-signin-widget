const { execSync } = require('child_process');

exports.command = 'start';
exports.desc = 'Starts the Okta Sign-in Widget playground';
exports.builder = {
  watch: {
    description: 'Watches JS and SASS changes'
  },
  mock: {
    description: 'Use pre-recorded responses for specific interactions',
    choices: [
      'mockDuo',
    ],
  },
  open: {
    description: 'Open the browser after the server starts',
    type: 'boolean',
    default: true,
  },
};

exports.handler = async (argv) => {
  const buildDevCmd = 'grunt build:dev';
  let startDevServer = 'webpack-dev-server --config webpack.playground.config.js';
  if (argv.open) {
    startDevServer += ' --open';
  }
  const mock = argv.mock ? `--env.${argv.mock}` : '';

  // use v3 workspace if --v3 flag is set or OKTA_SIW_V3 env var is truthy
  if (argv.v3 || process.env.OKTA_SIW_V3) {
    startDevServer = 'yarn workspace v3 dev';
  }

  let cmd;

  if (argv.watch) {
    // Watch mode requires we run tasks concurrently
    cmd = `concurrently "${buildDevCmd}:watch ${mock}" "grunt watch:sass" "${startDevServer}" --kill-others`;
  } else {
    cmd = `${buildDevCmd} ${mock} && ${startDevServer}`;
  }


  const options = {
    stdio: 'inherit',
    env: Object.assign({}, process.env)
  };

  console.log(`Running: ${cmd}`);
  execSync(cmd, options);
};
