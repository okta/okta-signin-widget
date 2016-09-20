define(['util/Util'], function (Util) {

  describe('util/Util', function () {

    describe('expandLanguages', function () {
      it('works with an empty array', function () {
        var languages = [],
            expected = [];
        expect(Util.expandLanguages(languages)).toEqual(expected);
      });
      it('works in the default "en" case', function () {
        var languages = ['en'],
            expected = ['en'];
        expect(Util.expandLanguages(languages)).toEqual(expected);
      });
      it('expands with 2 parts (regions) in the correct order', function () {
        var languages = ['pt-BR'],
            expected = ['pt-BR', 'pt'];
        expect(Util.expandLanguages(languages)).toEqual(expected);
      });
      it('expands when there are 3 parts (regions+dialects) in the correct order', function () {
        var languages = ['de-DE-bavarian'],
            expected = ['de-DE-bavarian', 'de-DE', 'de'];
        expect(Util.expandLanguages(languages)).toEqual(expected);
      });
      it('returns a flattened array with multiple languages', function () {
        var languages = ['en', 'pt-BR', 'ja', 'zh-CN'],
            expected = ['en', 'pt-BR', 'pt', 'ja', 'zh-CN', 'zh'];
        expect(Util.expandLanguages(languages)).toEqual(expected);
      });
      it('filters out any duplicates that are generated', function () {
        var languages = ['en-US', 'en'],
            expected = ['en-US', 'en'];
        expect(Util.expandLanguages(languages)).toEqual(expected);
      });
      it('filters out duplicates that are passed in (correct order)', function () {
        var languages = ['en-US', 'ja', 'en'],
            expected = ['en-US', 'en', 'ja'];
        expect(Util.expandLanguages(languages)).toEqual(expected);
      });
    });

    describe('toLower', function () {
      it('lowercases all string entries in a given array', function () {
        var arr = ['Hi', 'THERE', 'i', 'wOUld'],
            expected = ['hi', 'there', 'i', 'would'];
        expect(Util.toLower(arr)).toEqual(expected);
      });
    });

  });

});