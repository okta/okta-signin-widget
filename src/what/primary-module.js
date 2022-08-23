import {What} from 'what/tinymodule';
import {AnotherClass} from 'what/another-module';

var TheModule = (function() {

  this.what = new What();

  return TheModule;
})();
module.exports = {
  TheModule,
  AnotherClass
};

