define(['../lib/fn.js'],
  function (fn) {
    describe('fn', function () {
      describe('getLocaleFromFileName', function () {
        it('is able to retrieve the locale name', function () {
          var locale = fn.getLocaleFromFileName('login_en.json');
          expect(locale).toEqual('en');
        });
        it('is able to retrieve the locale name if locale has an underscore in the name', function () {
          var locale = fn.getLocaleFromFileName('login_en_TN.json');
          expect(locale).toEqual('en-tn');
        });
      });
      describe('addDefineToJSON', function () {
        it('adds define to json', function () {
          var result = fn.addDefineToJson('{"foo": "bar"}');
          expect(result).toEqual('define({"foo": "bar"});');
        });
      });
      describe('addToRootLocales', function () {
        it('correctly starts from scratch', function () {
          var result = fn.addToRootLocales('', 'en');
          expect(result).toEqual(',"en":true');
        });
        it('correctly appends to to existing string', function () {
          var result = fn.addToRootLocales(',"en":true', 'fr');
          expect(result).toEqual(',"en":true,"fr":true');
        });
      });
      describe('generateRootLocalesJSON', function () {
        it('adds define to json', function () {
          var result = fn.generateRootLocalesJSON('{"foo": "bar"}', ',"en":true');
          expect(result).toEqual('define({root:{"foo": "bar"},"en":true});');
        });
      });
      describe('getOutputFileName', function () {
        it('retrieves the local name correctly', function () {
          var outputName = fn.getOutputFileName('login_en.json');
          expect(outputName).toEqual('login.js');
        });
      });
      describe('isFileNameWithLocale', function () {
        it('returns true if file has locale', function () {
          var result = fn.isFileNameWithLocale('local_fr.json');
          expect(result).toEqual(true);
        });
        it('returns false if file has no locale', function () {
          var result = fn.isFileNameWithLocale('local.json');
          expect(result).toEqual(false);
        });
      });
      describe('appendSlashToStringIfNotExists', function () {
        it('appends if does not currently exist', function () {
          var result = fn.appendSlashToStringIfNotExists('blah');
          expect(result).toEqual('blah/');
        });
        it('does not append if the slash already exists', function () {
          var result = fn.appendSlashToStringIfNotExists('blah/');
          expect(result).toEqual('blah/');
        });
      });
    });
  });