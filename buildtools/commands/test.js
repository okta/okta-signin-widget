const { resolve } = require('path');
const { execSync } = require('child_process');

exports.command = 'test';
exports.desc = 'Runs tests for the Okta Sign-in Widget';
exports.builder = {
  type: {
    alias: 't',
    description: 'Type of the test runner',
    choices: [
      'karma',
      'jest',
      'testcafe',
    ],
    required: true,
  },
  config: {
    description: 'Optional override for the test config file',
  },
  suiteHelp: {
    description: 'Run this to see the test CLI options',
  },
};

const suiteMap = {
  karma: {
    cmd: 'karma start',
    config: 'karma.conf.js',
    preReq: [
      'grunt assets',
    ],
  },
  jest: {
    cmd: 'jest',
    config: 'jest.config.js',
    preReq: [
      'grunt assets',
    ],
  },
  testcafe: {
    cmd: 'testcafe',
    preReq: [
      'wait-on http-get://localhost:3000', // Requires the dev-server to run
    ]
  }
};

exports.handler = async (argv) => {
  const packageDir = process.cwd();
  const testType = suiteMap[argv.type];
  
  // Start building the test command
  let { cmd } = testType;

  if (testType.config) {
    // If we have an available configuration file, use it
    const defaultConfig = resolve(packageDir, testType.config);
    cmd += argv.config ? '' : ` --config ${defaultConfig}`;
  }

  // Show CLI configuration
  const help = argv.suiteHelp ? ' --help' : '';

  // Get additional CLI args
  const additionalArgs = process.argv.slice(5).join(' ');
  cmd += `${help} ${additionalArgs}`;

  const options = {
    stdio: 'inherit',
    env: Object.assign({}, process.env)
  };

  // Runs required prerequisite scripts
  if (!help) {
    testType.preReq.forEach(script => {
      console.log(`Running prerequisite script: ${script}`);
      execSync(script, options);
    });
  }

  console.log(`Running: ${cmd}`);
  execSync(cmd, options);
};
