import 'jest-canvas-mock';
import $ from 'jquery';
import jasmine from 'jasmine';
import fs from 'fs';
import path from 'path';

global.$ = global.jQuery = $;
global.DEBUG = false;
global.getJasmineRequireObj = function jestSetupGlobalJasmine() {
  return jasmine;
};
global.jasmine = jasmine;
global.useJest = true;

navigator.credentials = {
  create: function () {
    return Promise.resolve({
      response: {}
    });
  },
  get: function () {
    return Promise.resolve({
      response: {}
    });
  }
};

const css = fs.readFileSync(path.resolve(__dirname, '../../..', 'target/css/okta-sign-in.css'), 'utf8');
$('head').append(`<style>${css}</style>`);
