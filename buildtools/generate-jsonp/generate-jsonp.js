/*global module */
var path = require('path');

module.exports = function (grunt) {

  // Name will be the base property file, i.e. "login" or "country"
  function wrapperName (fileName) {
    var base = path.basename(fileName, '.json');
    return base.split('_')[0];
  }

  // Wraps json in this format:
  // jsonp_{{name}}(contents);
  //
  // For example:
  // jsonp_login({ key: 'val' });
  function wrap (name, contents) {
    return 'jsonp_' + name + '(' + contents + ');';
  }

  function generateJsonP () {
    this.files.forEach(function (file) {
      var fileSrc = file.src[0],
          name = wrapperName(fileSrc),
          contents = grunt.file.read(fileSrc),
          dest = file.dest.replace(/json/g, 'jsonp');

      grunt.log.writeln('Writing jsonp to ' + dest + ' with wrapper ' + name);
      grunt.file.write(dest, wrap(name, contents));
    });
  }

  grunt.registerMultiTask(
    'generate-jsonp',
    'Creates jsonp version of our property files',
    generateJsonP
  );

};
