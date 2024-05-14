/* eslint max-statements: [2, 30],  max-depth: [2, 3], complexity: [2, 30] */
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

// Utils
const pushIfNotExists = (arr, item) => {
  if (arr.indexOf(item) === -1) {
    arr.push(item);
  }
};

const removeIfExists = (arr, item) => {
  const index = arr.indexOf(item);
  if (index !== -1) {
    arr.splice(index, 1);
  }
};

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
    if (!pkg.devDependency) {
      pushIfNotExists(result.unused, pkg.moduleName);
    }
    return false;
  } else {
    removeIfExists(result.unused, pkg.moduleName);
  }
  if (aliases.includes(pkg.moduleName + '/*') || ['types'].includes(pkg.moduleName)) {
    // Ignore path alias
    return false;
  }
  if (aliases.includes(pkg.moduleName) && pkg.regError && pkg.pkgError) {
    // Internal package that is not present in registry, not installed in node_modules
    // Can occur if local package is listed in webpack's `resolve.alias`
    // Examples: @okta/handlebars-inline-precompile, @okta/okta-i18n-bundles, 
    //  @okta/qtip, @okta/duo, @okta/typingdna
    pushIfNotExists(result.hidden, pkg.moduleName);
    return false;
  }
  if (aliases.includes(pkg.moduleName) && !pkg.regError && pkg.pkgError) {
    // Internal package that is present in registry, not installed in node_modules
    // Can occur if local package is listed in webpack's `resolve.alias`
    // Example: backbone
    pushIfNotExists(result.overridden, pkg.moduleName);
    return false;
  }
  if (aliases.includes(pkg.moduleName) && pkg.regError && pkg.isInstalled) {
    // Internal package that is not present in registry, is installed in node_modules
    // Can occur if local package is listed in `workspaces`
    // Example: @okta/courage (packages/@okta/courage-dist)
    pushIfNotExists(result.internal, pkg.moduleName);
    return false;
  }
  if (aliases.includes(pkg.moduleName) && !pkg.regError && pkg.isInstalled) {
    // Internal package that is present in registry, is installed in node_modules
    // Can occur if local package is listed in `workspaces`
    pushIfNotExists(result.warning, pkg.moduleName);
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

(async () => {
  try {
    const result = {
      hidden: [],
      overridden: [],
      internal: [],
      warning: [],
      unused: []
    };
    
    // Run npm-check that detects missing packages, unused packages and packages to be updated
    const currentState = await npmCheck({
      cwd: ROOT
    });
    const internalPkgsRoot = currentState.get('packages')
      .map(mapPackages)
      .filter(pkg => filterPackages(pkg, result));
    
    // Also find internal packages references inside courage-dist
    const currentStateCourage = await npmCheck({
      cwd: path.resolve(ROOT, 'packages/@okta/courage-dist')
    });
    const internalPkgsCourage = currentStateCourage.get('packages')
      .map(mapPackages)
      .filter(pkg => filterPackages(pkg, result));
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
    if (result.unused.length) {
      console.log('Unused packages:', result.unused.join(', '));
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
