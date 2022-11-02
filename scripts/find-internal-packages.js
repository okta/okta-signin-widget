const npmCheck = require('npm-check');
const process = require('process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const packageJson = require(path.resolve(ROOT, 'package.json'));
const dependencies = Object.keys(packageJson.dependencies);

// Get list of expected internal packages from 'paths' in tsconfig
const tsConfig = require(path.resolve(ROOT, 'tsconfig.json'));
let aliases = Object.keys(tsConfig.compilerOptions.paths);
// Add aliases from 'tsconfig-paths-module-resolver' in babel config
aliases = [
  ...aliases,
  'backbone',
  'underscore',
  'handlebars',
];
// Ignore some aliases
aliases = aliases.filter(alias => ![
  'views/*', // not used in src
  'types/*', // not used in src
  'util/*', // not detected by npm-check, maybe confusion with node:util ?
].includes(alias));
aliases = aliases.filter(alias => !dependencies.includes(alias));

// Map result of npm-check: add 'files' with list of source files that require package
const mapPackages = pkg => {
  // Parse list of source files if it's present
  let files = [];
  if (pkg.notInPackageJson?.startsWith('Found in: ')) {
    files = pkg.notInPackageJson.substring('Found in: '.length).split(', ');
  }
  // Ignore SCSS deps, deps for tests, polyfill deps
  files = files.filter(path => !path.endsWith('.scss'));
  files = files.filter(path => !path.startsWith('/test/'));
  if (!pkg.notInPackageJson) {
    files = undefined;
  }
  return {
    ...pkg,
    files
  };
};

// Filter result of npm-check: include only internal packages
const filterPackages = (pkg, result) => {
  if (pkg.unused) {
    // Ignore unused package
    return false;
  }
  if (aliases.includes(pkg.moduleName + '/*') || ['types'].includes(pkg.moduleName)) {
    // Ignore path alias
    return false;
  }
  if (aliases.includes(pkg.moduleName) && pkg.regError && pkg.pkgError) {
    // Internal package that is not present in registry and not installed in node_modules
    result.hidden.push(pkg.moduleName);
    return false;
  }
  if (aliases.includes(pkg.moduleName) && !pkg.regError && pkg.pkgError) {
    // Internal package that IS present in registry but not installed in node_modules (backbone)
    result.overridden.push(pkg.moduleName);
    return false;
  }
  if (aliases.includes(pkg.moduleName) && pkg.regError && pkg.isInstalled) {
    // Internal package that is not present in registry but is present in node_modules (@okta/okta)
    result.internal.push(pkg.moduleName);
    return false;
  }
  if (aliases.includes(pkg.moduleName) && !pkg.regError && pkg.isInstalled) {
    // Internal package is present in registry but overriden with internal one in node_modules
    result.warning.push(pkg.moduleName);
    return false;
  }
  if (!pkg.regError && !pkg.pkgError && pkg.isInstalled) {
    // Ignore package update recommendations
    return false;
  }
  if (pkg.files && !pkg.files.length) {
    // All source files are ignored (package used in tests)
    return false;
  }
  return true;
};

return (async () => {
  try {
    const result = {
      hidden: [],
      overridden: [],
      internal: [],
      warning: []
    };
    
    // Run npm-check that detects missing packages, unused packages and packages to be updated
    const currentState = await npmCheck({
      cwd: ROOT
    });
    const internalPkgsRoot = currentState.get('packages').map(mapPackages).filter(pkg => filterPackages(pkg, result));
    
    // Also find internal packages references inside courage-dist
    const currentStateCourage = await npmCheck({
      cwd: path.resolve(ROOT, 'packages/@okta/courage-dist')
    });
    const internalPkgsCourage = currentStateCourage.get('packages').map(mapPackages).filter(pkg => filterPackages(pkg, result));
    const internalPkgs = [
      ...internalPkgsRoot,
      ...internalPkgsCourage,
    ];

    // Output result
    let exitCode = 0;
    console.error('Internal packages:');
    if (result.hidden.length) {
      console.log('- not present in registry:', result.hidden.join(', '));
    }
    if (result.overridden.length) {
      console.log('- present in registry:', result.overridden.join(', '));
    }
    if (result.internal.length) {
      console.log('- not present in registry, installed in node_modules:', result.internal.join(', '));
      // Should have @okta namespace
      if (result.internal.filter(n => !n.startsWith('@okta/')).length) {
        exitCode = 1;
      }
    }
    if (result.warning.length) {
      console.log('- present in registry, installed in node_modules:', result.warning.join(', '));
      // Should have @okta namespace
      if (result.warning.filter(n => !n.startsWith('@okta/')).length) {
        exitCode = 1;
      }
    }

    // Unexpected internal packages found in npm-check result
    if (internalPkgs.length) {
      console.error('Unexpected internal packages:');
      console.error(internalPkgs);
      exitCode = 1;
    }

    process.exit(exitCode);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
