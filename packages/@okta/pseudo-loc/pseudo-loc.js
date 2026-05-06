const { execSync } = require('child_process');
const {
  mkdtempSync,
  mkdirSync,
  symlinkSync,
  rmSync,
} = require('fs');
const { tmpdir } = require('os');
const { join, resolve } = require('path');

// @okta/tools.i18n.pseudo-loc derives the repo name from the cwd by splitting
// on "/" and taking the segment after a literal "okta" segment (Okta's
// internal /okta/<repo>/... clone convention). When the repo lives elsewhere
// (e.g. ~/opensource/okta-signin-widget), that lookup returns undefined and
// every SK entry is written as [[undefined:login: ...]]. Run the tool from
// inside a temp symlink tree that always has /okta/okta-signin-widget/ in
// the path, so the heuristic succeeds regardless of the real clone path.
const prepareRunDir = () => {
  const repoRoot = resolve(__dirname, '../../..');
  const tmpRoot = mkdtempSync(join(tmpdir(), 'siw-pseudoloc-'));
  const oktaDir = join(tmpRoot, 'okta');
  const repoLink = join(oktaDir, 'okta-signin-widget');
  mkdirSync(oktaDir, { recursive: true });
  symlinkSync(repoRoot, repoLink, 'dir');
  return { tmpRoot, runCwd: join(repoLink, 'packages/@okta/pseudo-loc') };
};

const generate = () => {
  console.log('================= Generating pseudo-loc properties =============');
  const bundles = [
    'country',
    'login',
  ];

  const { tmpRoot, runCwd } = prepareRunDir();
  try {
    bundles.forEach((bundle) => {
      const pseudoLocCmd = `pseudo-loc generate --packageName ${runCwd} --resourcePath ../i18n/src/properties --bundle ${bundle}`;
      execSync(pseudoLocCmd, {
        cwd: runCwd,
        stdio: 'inherit',
      });
    });

    // TODO: The pseudo-loc package assumes that all translation files live within a "properties/translations" directory
    //       To keep the format consistent, we move them by hand here:
    const fromDir = '../i18n/src/properties/translations';
    const toDir = '../i18n/src/properties/';
    const copyCmd = `mv ${fromDir}/** ${toDir} && rm -rf ${fromDir}`;

    console.log('======= Migrating files =======');
    execSync(copyCmd, {
      cwd: runCwd,
      stdio: 'inherit',
    });
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
};

generate();