/* eslint max-len: [2, 140] */
define([
  'okta',
  'sandbox',
  'util/Util',
  'util/Logger'
], function (Okta, $sandbox, Util, Logger) {

  var { $ } = Okta;

  describe('util/Util', function () {

    describe('transformErrorXHR', function () {
      it('errorSummary shows network connection error when status is 0', function () {
        var xhr = {
          'status': 0
        };
        Util.transformErrorXHR(xhr);
        expect(xhr.responseJSON.errorSummary).toEqual('Unable to connect to the server. Please check your network connection.');
      });
      it('errorSummary shows internal error when there are no responseJSON and no responseText', function () {
        var xhr = {
          'status': 400
        };
        Util.transformErrorXHR(xhr);
        expect(xhr.responseJSON.errorSummary).toEqual('There was an unexpected internal error. Please try again.');
      });
      it('errorSummary is set from responseText when there is no responseJSON', function () {
        var responseText = { errorSummary: 'errorSummary from responseText' };
        var xhr = {
          'status': 400,
          'responseText': responseText
        };
        Util.transformErrorXHR(xhr);
        expect(xhr.responseJSON.errorSummary).toEqual('errorSummary from responseText');
      });
      it('If there is an errorCauses array and there is no error code, get errorSummary from errorCauses array', function () {
        var errorCauses = [{
          'errorSummary': 'errorSummary from errorCauses'
        }];
        var xhr = {
          'status': 400,
          'responseJSON': {
            'errorCauses': errorCauses
          }
        };
        Util.transformErrorXHR(xhr);
        expect(xhr.responseJSON.errorSummary).toEqual('errorSummary from errorCauses');
        expect(xhr.responseJSON.errorCauses).toBe(errorCauses);
      });
      it('If there is an errorCauses array and there is an invalid error code, get errorSummary from errorCauses array', function () {
        var errorCauses = [{
          'errorSummary': 'errorSummary from errorCauses'
        }];
        var xhr = {
          'status': 400,
          'responseJSON': {
            'errorCauses': errorCauses,
            'errorCode': 'E01212AB'
          }
        };
        Util.transformErrorXHR(xhr);
        expect(xhr.responseJSON.errorSummary).toEqual('errorSummary from errorCauses');
        expect(xhr.responseJSON.errorCauses).toBe(errorCauses);
      });
      it('If there is a valid error code, get errorSummary from that and delete errorCauses array', function () {
        var errorCauses = [{
          'errorSummary': 'errorSummary from errorCauses'
        }];
        var xhr = {
          'status': 400,
          'responseJSON': {
            'errorCauses': errorCauses,
            'errorCode': 'E0000017'
          }
        };
        Util.transformErrorXHR(xhr);
        expect(xhr.responseJSON.errorSummary).toEqual('Password reset failed');
        expect(xhr.responseJSON.errorCauses).not.toBeDefined();
      });
    });

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

    describe('debugMessage', function () {
      it('formats template literal strings into a consistent format', function () {
        spyOn(Logger, 'warn');
        var debugMessage = `
          Multi-line
          String
          Message
        `;
        Util.debugMessage(debugMessage);
        expect(Logger.warn).toHaveBeenCalledWith('\nMulti-line\nString\nMessage\n');
      });
    });

    describe('redirect', function () {
      beforeEach(function () {
        spyOn(Logger, 'error');
      });
      it('should load the URL', function () {
        const win = jasmine.createSpyObj('window', {'location': 'href'});
        Util.redirect('http://example.com/idp/123', win);
        expect(win.location.href).toEqual('http://example.com/idp/123');
      });
      it('should not load an empty URL', function () {
        Util.redirect('');
        expect(Logger.error.calls.count()).toBe(1);
        expect(Logger.error).toHaveBeenCalledWith(
          'Cannot redirect to empty URL: ()'
        );
      });
    });

    describe('redirectWithFormGet', function () {

      beforeEach(function () {
        spyOn(Logger, 'error');
        spyOn(HTMLFormElement.prototype, 'submit');
        $sandbox.append('<div id="okta-sign-in"></div>');
      });
      afterEach(function () {
        $sandbox.empty();
      });

      it('shall submit a plain URL', function () {
        Util.redirectWithFormGet('http://example.com/idp/123');

        expect($('#okta-sign-in form')[0].submit.calls.count()).toBe(1);
        expect($('#okta-sign-in').html()).toBe(
          '<form method="get" style="display: none;" action="http://example.com/idp/123">' +
          '</form>'
        );
      });
      it('shall submit URL that has query pamaters', function () {
        Util.redirectWithFormGet('http://example.com/idp/123?foo=aaa&bar=bbb');

        expect($('#okta-sign-in form')[0].submit.calls.count()).toBe(1);
        expect($('#okta-sign-in').html()).toBe(
          '<form method="get" style="display: none;" action="http://example.com/idp/123">' +
          '<input name="foo" type="hidden" value="aaa">' +
          '<input name="bar" type="hidden" value="bbb">' +
          '</form>'
        );
      });
      it('shall submit URL that has query pamaters and fragement', function () {
        Util.redirectWithFormGet('http://example.com/idp/123?redirectURI=https%3A%2F%2Ffoo.com#hello=okta');

        expect($('#okta-sign-in form')[0].submit.calls.count()).toBe(1);
        expect($('#okta-sign-in').html()).toBe(
          '<form method="get" style="display: none;" action="http://example.com/idp/123#hello=okta">' +
          '<input name="redirectURI" type="hidden" value="https://foo.com">' +
          '</form>'
        );
      });
      it('shall submit URL that encoded XSS value', function () {
        Util.redirectWithFormGet('http://example.com/idp/123?foo=a%22%2F%3E%3Cimg%20error%3D%22alert(11)%22%20src%3D%22xx%22%2F%3E');

        expect($('#okta-sign-in form')[0].submit.calls.count()).toBe(1);
        expect($('#okta-sign-in').html()).toBe(
          '<form method="get" style="display: none;" action="http://example.com/idp/123">' +
          '<input name="foo" type="hidden" value="a&quot;/><img error=&quot;alert(11)&quot; src=&quot;xx&quot;/>">' +
          '</form>'
        );
      });
      it('shall submit URL that XSS value', function () {
        Util.redirectWithFormGet('http://example.com/idp/123?foo=%22/><img error="alert(2)" src="yy"/>');

        expect($('#okta-sign-in form')[0].submit.calls.count()).toBe(1);
        expect($('#okta-sign-in').html()).toBe(
          '<form method="get" style="display: none;" action="http://example.com/idp/123">' +
          '<input name="foo" type="hidden" value="&quot;/><img error">' +
          '</form>'
        );
      });
      it('shall not submit anything if the okta-sign-in container doesnot exists', function () {
        $('#okta-sign-in').remove();
        Util.redirectWithFormGet('http://example.com/idp/123');
        expect($('#okta-sign-in form').length).toBe(0);
        expect(Logger.error.calls.count()).toBe(1);
        expect(Logger.error).toHaveBeenCalledWith(
          'Cannot find okta-sign-in container append to which a form'
        );
      });
      it('shall not submit an empty URL', function () {
        Util.redirectWithFormGet('');
        expect($('#okta-sign-in form').length).toBe(0);
        expect(Logger.error.calls.count()).toBe(1);
        expect(Logger.error).toHaveBeenCalledWith(
          'Cannot redirect to empty URL: ()'
        );
      });

    });

  });

});
