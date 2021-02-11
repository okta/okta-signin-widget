const { execSync } = require('child_process');

const runCmd = () => {
  const package = process.cwd();
  const cmd = `cd packages/@okta/pseudo-loc && yarn install && yarn pseudo-loc`;
  execSync(cmd, {
    cwd: package,
    stdio: 'inherit'
  });

};

runCmd();

