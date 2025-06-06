const { resolve } = require('path');
const { execSync } = require('child_process');

exports.command = 'verify-translations';
exports.describe = 'Internal: Compare core and SIW translations that needs to be in sync';

exports.builder = {
  i18nRepoPath: {
    description: 'Path to i18n repo',
    type: 'string',
  },
  write: {
    description: 'True to write fixed translations into packages/@okta/i18n/src/properties',
    type: 'boolean',
    default: false,
  },
  useI18nRepoOnly: {
    description: 'True to compare core and SIW translations in i18n repo only, ignoring translations in SIW repo',
    type: 'boolean',
    default: false,
  }
};

exports.handler = async (argv) => {
  const packagePath = resolve(__dirname, '../../../packages/@okta/verify-translations');
  const installCmd = 'yarn install --silent';

  // Step 1: Install internal dependencies for the package
  execSync(installCmd, {
    cwd: packagePath,
    stdio: 'inherit'
  });

  // Step 2: Run the verify command
  let verifyCmd = 'yarn verify';
  if (argv.i18nRepoPath) {
    verifyCmd = `I18N_REPO_PATH="${argv.i18nRepoPath}" ${verifyCmd}`;
  }
  if (argv.useI18nRepoOnly) {
    verifyCmd = `USE_I18N_REPO_ONLY=true ${verifyCmd}`;
  }
  if (argv.write) {
    verifyCmd = `WRITE_FIXED_I18N=true ${verifyCmd}`;
  }
  execSync(verifyCmd, {
    cwd: packagePath,
    stdio: 'inherit'
  });
};
