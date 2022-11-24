const path = require('path');
const fs = require('fs');
const ENV = require('@okta/env');

ENV.config();
const { DIST_ESM, CLEAN } = process.env;
const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');
const NODE_MODULES = path.resolve(__dirname, '../node_modules');
const DIST = path.resolve(WORKSPACE_ROOT, 'dist');
const TARGET = path.resolve(NODE_MODULES, '@okta/okta-signin-widget');
const TARGET_PARENT = path.resolve(NODE_MODULES, '@okta');

function isExists(path) {
  try {
    fs.statSync(path);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
}

if (DIST_ESM && !CLEAN) {
  if (isExists(TARGET)) {
    console.log(`Deleting ${TARGET}`);
    fs.unlinkSync(TARGET);
  }
  if (!isExists(TARGET_PARENT)) {
    console.log(`Creating ${TARGET_PARENT}`);
    fs.mkdirSync(TARGET_PARENT);
  }
  console.log(`Creating symlink: ${DIST} -> ${TARGET}`);
  fs.symlinkSync(DIST, TARGET, 'dir');
} else {
  if (isExists(TARGET)) {
    console.log(`Deleting ${TARGET}`);
    fs.unlinkSync(TARGET);
  }
}
