/* eslint no-console: 0 */
/* globals __dirname */
const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const path = require('path');

// run npm pack
console.log('Running npm pack');
const output = execSync('npm pack').toString();
const filename = output.split('\n').slice(-2)[0];
if (!filename) {
  console.log(output);
  throw new Error('Unable to pack successfully');
}
const fullpath = path.join(__dirname, filename);

console.log(`Installing ${fullpath} to React App`);
execSync(`yarn --cwd test/e2e/react-app add ${fullpath}`);

console.log(`Installing ${fullpath} to Angular App`);
execSync(`yarn --cwd test/e2e/angular-app add ${fullpath}`);

console.log(`Deleting ${fullpath}`);
if (__dirname === fullpath) {
  throw new Error('Deletion would remove entire directory');
}
fs.removeSync(fullpath);
