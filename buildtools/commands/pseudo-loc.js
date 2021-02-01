const { resolve } = require('path');
const { execSync } = require('child_process');

exports.command = 'pseudo-loc';
exports.describe = 'Internal: Generates pseudo-loc properties files for the Widget';

exports.handler = async () => {
  // IMPORTANT:
  //   This utility requires VPN access to our internal NPM registry
  //   This script will fail without a connection
  const packagePath = resolve(__dirname, '../../packages/@okta/pseudo-loc');
  const installCmd = 'yarn install --silent';

  console.log('======= Installing Package Dependencies =======');
  try {
    // Step 1: Install internal dependencies for the package
    execSync(installCmd, {
      cwd: packagePath,
      stdio: 'inherit'
    });

    // Step 2: Run the generate command
    const generateCmd = 'yarn pseudo-loc';
    execSync(generateCmd, {
      cwd: packagePath,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(
      'Failed to generate pseudo-loc. This tool requires VPN access to our internal NPM registry.',
    );
  }
};
