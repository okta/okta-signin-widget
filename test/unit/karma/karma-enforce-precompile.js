/* eslint-disable no-console */
import { FrameworkView, _ } from 'okta';

const _viewAdd = FrameworkView.prototype.add;
FrameworkView.prototype.add = function (view) {
  if (_.isString(view) && view.indexOf('{{') >= 0) {
    const msg = 'Attempt to add an uncompiled template as a string: ' + view;
    console.error(msg);
    setImmediate(function () {
      throw new Error(msg); // fail test
    });
  }
  return _viewAdd.apply(this, arguments);
};

const _viewCompileTemplate = FrameworkView.prototype.compileTemplate;
FrameworkView.prototype.compileTemplate = function (str) {
  if (str.indexOf('{{') >= 0) {
    const msg = 'attempt to compile template: ' + str;
    console.error(msg);
    setImmediate(function () {
      throw new Error(msg); // fail test
    });
  }
  return _viewCompileTemplate.apply(this, arguments);
};
