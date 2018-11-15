/*global module */
module.exports = function (grunt) {

  function generateConfig () {

    var options = this.options(),
        languageGlob = options.languageGlob,
        out = options.out,
        config = {};

    // 1. Add current widget version number
    var packageJson = grunt.file.readJSON('package.json');
    config.version = packageJson.version;
    grunt.log.writeln('config.version: ' + config.version);

    // 2. Add list of supported languages
    var re = new RegExp('/[a-z]+_([^.]+).json');
    var supportedLanguages = grunt.file.expand(languageGlob).map(function (file) {
      // Language codes use a hyphen instead of an underscore, i.e.
      // login_zh_TW.json -> zh-TW
      return re.exec(file)[1].replace('_', '-');
    });
    // English is special - it is just login.json, and is ignored in our glob.
    supportedLanguages.unshift('en');
    config.supportedLanguages = supportedLanguages;
    grunt.log.writeln('config.supportedLanguages:');
    grunt.log.writeln(config.supportedLanguages);

    grunt.file.write(out, JSON.stringify(config, null, 2));
    grunt.log.writeln('Wrote config to ' + out);
  }

  grunt.registerTask(
    'generate-config',
    'Generates build time config of the widget (version, supported languages)',
    generateConfig
  );

};
