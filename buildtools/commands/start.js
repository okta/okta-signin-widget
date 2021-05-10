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
};

exports.handler = async (argv) => {
  const buildDevCmd = 'grunt build:dev';
  const startDevServer = 'webpack-dev-server --config webpack.playground.config.js';
  const mock = argv.mock ? `--env.${argv.mock}` : '';

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
