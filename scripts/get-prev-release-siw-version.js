#!/usr/bin/env node
const shelljs = require('shelljs');

let versions;
try {
  const output = shelljs.exec('yarn info @okta/okta-signin-widget versions --json', { silent: true }).stdout;
  versions = JSON.parse(output).data;
} catch (err) {
  console.error('Failed to get siw versions', err);
}

// get the first occurance without '-' (n-1 published version)
const lastPublishedVersion = versions.reverse().find(v => !v.includes('-'));
console.log(lastPublishedVersion);
