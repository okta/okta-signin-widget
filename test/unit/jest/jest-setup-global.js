import 'jest-canvas-mock';
import $ from 'jquery';
import jasmine from 'jasmine';

global.$ = global.jQuery = $;
global.DEBUG = false;
global.getJasmineRequireObj = function jestSetupGlobalJasmine() {
  return jasmine;
};
global.jasmine = jasmine;
global.useJest = true;

navigator.credentials = {
  create: function() {
    return Promise.resolve({
      response: {}
    });
  },
  get: function() {
    return Promise.resolve({
      response: {}
    });
  }
};
