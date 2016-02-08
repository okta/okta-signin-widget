/*global module*/
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof require === 'function' && typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.fn = factory();
  }
}(this, function () {
  //the regex is used to look up the translated json files
  var FILE_PATTERN_REGEX = new RegExp('([^_]+)_([a-z]{2})_?([A-Z]{2})?'),
      fn = {};

  //retrieves the locale from each .json file name
  //for example from local_fr.json, the locale is fr
  fn.getLocaleFromFileName = function (file) {
    var result = FILE_PATTERN_REGEX.exec(file);
    var locale = result[2].toLowerCase();

    //to handle the case where we have languages like zh_TW or zh_cN.
    //mirrors behavior in props2js.ConvertToJs
    if (result[3] !== undefined) {
      locale = locale + '-' + result[3].toLowerCase();
    }
    return locale;
  };

  //add define to the json to make it compatible with requirejs
  fn.addDefineToJson = function (json) {
    return 'define(' + json + ');';
  };

  //create a string mapping of each of the languages for require js purposes
  //more context: http://requirejs.org/docs/api.html#i18n
  fn.addToRootLocales = function (currentRootLocales, newLocale) {
    return currentRootLocales + ',"' + newLocale + '":true';
  };

  //append the define needed for the root js file.
  //More context: http://requirejs.org/docs/api.html#i18n
  //example output: define({root:{"foo":"bar","cat":"dog"},"da":true,"de":true});
  fn.generateRootLocalesJSON = function (json, rootLocales) {
    return fn.addDefineToJson('{root:' + json + rootLocales + '}');
  };

  //get the name of the file to write out to: i.e. if the json file
  //is called login_fr.json, this function will return login.js
  fn.getOutputFileName = function (file) {
    var result = FILE_PATTERN_REGEX.exec(file);
    var outputName = result[1];
    outputName = outputName + '.js'; //name of the js file in each of the folders
    return outputName;
  };

  //evaluates the file name to see if contains a locale
  fn.isFileNameWithLocale = function (file) {
    var result = FILE_PATTERN_REGEX.exec(file);
    return result !== null;
  };

  //adds a slash if it does not exist
  fn.appendSlashToStringIfNotExists = function (str) {
    if (str.charAt(str.length - 1) !== '/') {
      str = str + '/';
    }
    return str;
  };

  return fn;
}));