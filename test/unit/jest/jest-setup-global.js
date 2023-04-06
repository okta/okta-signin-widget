import 'jest-canvas-mock';
import $ from 'jquery';
import jasmine from 'jasmine';

global.$ = global.jQuery = $;
global.DEBUG = false;
global.getJasmineRequireObj = function jestSetupGlobalJasmine() {
  return jasmine;
};
global.jasmine = jasmine;

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

// prevent unhandled promise
process.on('unhandledRejection', console.error);
