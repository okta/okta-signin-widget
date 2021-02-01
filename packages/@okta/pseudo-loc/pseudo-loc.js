const { execSync } = require('child_process');

const generate = () => {
  console.log('================= Generating pseudo-loc properties =============');
  const bundles = [
    'country',
    'login',
  ];
  const package = process.cwd();
  bundles.forEach((bundle) => {
    let pseudoLocCmd = `pseudo-loc generate --packageName ${package} --resourcePath ../i18n/src/properties --bundle ${bundle}`;
    execSync(pseudoLocCmd, {
      cwd: package,
      stdio: 'inherit'
    });
  });

  // TODO: The pseudo-loc package assumes that all translation files live within a "properties/translations" directory
  // To keep the format consistent, we move them by hand here:
  const fromDir = '../i18n/src/properties/translations';
  const toDir = '../i18n/src/properties/';
  const copyCmd = `mv ${fromDir}/** ${toDir} && rm -rf ${fromDir}`;
  
  console.log('======= Migrating files =======');
  execSync(copyCmd, {
    cwd: package,
    stdio: 'inherit'
  });

};

generate();