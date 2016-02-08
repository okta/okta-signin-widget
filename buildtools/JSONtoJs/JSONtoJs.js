/*global module */
var fn = require('./lib/fn');

//reads in .json files and writes out requirejs files
module.exports = function (grunt) {
  var rootLocales = '',
      config = grunt.config()['JSONtoJs'],
      noLocaleJSON = {},
      localNames = [],
      src = config.src,
      dest = config.dest;

  function JSONtoJs() {
    //make sure that the src has a '/' at the end,
    //otherwise appends the '/'
    src = fn.appendSlashToStringIfNotExists(src);

    grunt.file.recurse(src, function (file) {
      if (file.substr(-5) !== '.json') {
        return;
      }
      var json = JSON.stringify(grunt.file.readJSON(file));

      //make sure we only have the file name and do not include the path
      file = file.substring(src.length);

      if (fn.isFileNameWithLocale(file)) {
        var localName = fn.getOutputFileName(file);
        if (localNames.indexOf(localName) === -1) {
          localNames.push(localName);
        }
        var locale = fn.getLocaleFromFileName(file);

        //make the folder for each locale if it does not exist
        //the folder structure is: target/js/nls/{locale}
        grunt.file.mkdir(dest + locale);

        //construct json to write to file
        json = fn.addDefineToJson(json);
        grunt.file.write(dest + locale + '/' + localName, json);

        //needed to help generate the root locales file
        rootLocales = fn.addToRootLocales(rootLocales, locale);
      } else {
        //the -2 is to make sure we have matching keys, the file name is '.json'
        //but the local name is '.js'
        noLocaleJSON[file.substring(0, file.length - 2)] = json;
      }
    });

    //now define a root bundle js file in the nls directory
    //see http://requirejs.org/docs/api.html#i18n for more info
    for (var i = 0; i < localNames.length; i++) {
      var localName = localNames[i];
      grunt.file.write(dest + localName, fn.generateRootLocalesJSON(noLocaleJSON[localNames[i]], rootLocales));
    }
  }
  grunt.registerTask('JSONtoJs', 'Converts JSON files to requirejs files.', JSONtoJs);
};