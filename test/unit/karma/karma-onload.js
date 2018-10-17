/* eslint-env browser */

// Overriding the karma start method to execute the tests once the dom is ready
// Without this, the start method is triggered before the dom is loaded,
// which could result in failing tests
var karma = window.__karma__;

var originalStart = karma.start;
karma.start = function () {
  var args = arguments;
  document.addEventListener('DOMContentLoaded', function () {
    originalStart.apply(this, args);
  });
};
