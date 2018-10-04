/* eslint no-undef: 0 */

const path = require('path');

const createPattern = function (pattern) {
  return { pattern, included: true, served: true, watched: false };
};

const initKarmaOverrides = function (files) {
  files.unshift(createPattern(path.join(__dirname, 'karma-onload.js')));
};

initKarmaOverrides.$inject = ['config.files'];

module.exports = {
  'framework:karma-overrides': ['factory', initKarmaOverrides],
};
