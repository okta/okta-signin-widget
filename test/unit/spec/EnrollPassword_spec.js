/* eslint max-params: [2, 18] */
define([
  'q',
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/EnrollPasswordForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'util/RouterUtil',
  'util/Util',
  'sandbox',
  'helpers/xhr/FACTOR_ENROLL_allFactors',
  'helpers/xhr/FACTOR_ENROLL_password_error',
  'helpers/xhr/SUCCESS'
],
function (Q, Okta, OktaAuth, Util, Form, Beacon, Expect, Router, RouterUtil, LoginUtil, $sandbox,
  resAllFactors, resError, resSuccess) {

  var { $ } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollPassword', function () {

    function setup (startRouter, restrictRedirectToForeground) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({ url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR });
      var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
      var successSpy = jasmine.createSpy('success');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': startRouter,
        'features.restrictRedirectToForeground': restrictRedirectToForeground,
        globalSuccessFn: successSpy,
      });
      router.on('afterError', afterErrorHandler);
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      return tick()
        .then(function () {
          setNextResponse(resAllFactors);
          return Util.mockIntrospectResponse(router, resAllFactors);
        })
        .then(function () {
          setNextResponse(resAllFactors);
          router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
          router.enrollPassword();
          return Expect.waitForEnrollPassword({
            router: router,
            beacon: new Beacon($sandbox),
            form: new Form($sandbox),
            ac: authClient,
            setNextResponse: setNextResponse,
            successSpy: successSpy,
            afterErrorHandler: afterErrorHandler
          });
        });
    }

    itp('displays the correct factorBeacon', function () {
      return setup().then(function (test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-okta-password')).toBe(true);
      });
    });
    itp('does not allow autocomplete', function () {
      return setup().then(function (test) {
        expect(test.form.getPasswordAutocomplete()).toBe('off');
        expect(test.form.getConfirmPasswordAutocomplete()).toBe('off');
      });
    });
    itp('has a password field', function () {
      return setup().then(function (test) {
        var password = test.form.passwordField();
        expect(password.length).toBe(1);
        expect(password.attr('type')).toEqual('password');
      });
    });
    itp('has a confirm password field', function () {
      return setup().then(function (test) {
        var confirmPassword = test.form.confirmPasswordField();
        expect(confirmPassword.length).toBe(1);
        expect(confirmPassword.attr('type')).toEqual('password');
      });
    });
    itp('returns to factor list when browser\'s back button is clicked', function () {
      return setup(true).then(function (test) {
        Util.triggerBrowserBackButton();
        return Expect.waitForEnrollChoices(test);
      })
        .then(function (test) {
          Expect.isEnrollChoices(test.router.controller);
          Util.stopRouter();
        });
    });
    itp('calls enroll with the right arguments when save is clicked', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.setPassword('somepassword');
        test.form.setConfirmPassword('somepassword');
        test.setNextResponse(resSuccess);
        spyOn(RouterUtil, 'isHostBackgroundChromeTab').and.callThrough();
        test.form.submit();
        return Expect.waitForSpyCall(test.successSpy, test);
      })
        .then(function () {
          // restrictRedirectToForeground Flag is not enabled
          expect(RouterUtil.isHostBackgroundChromeTab).not.toHaveBeenCalled();
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'password',
              provider: 'OKTA',
              profile: {
                password: 'somepassword'
              },
              stateToken: '01testStateToken'
            }
          });
        });
    });

    itp(`calls enroll with the right arguments when save is clicked in android chrome
      in restrictRedirectToForeground flow`, function () {
      return setup(false, true).then(function (test) {
        $.ajax.calls.reset();
        test.form.setPassword('somepassword');
        test.form.setConfirmPassword('somepassword');
        test.setNextResponse(resSuccess);
        spyOn(RouterUtil, 'isHostBackgroundChromeTab').and.callFake(function () {
          return true;
        });
        spyOn(document, 'addEventListener').and.callFake(function (type, fn){
          fn();
        });
        spyOn(document, 'removeEventListener').and.callThrough();
        test.form.submit();

        spyOn(RouterUtil, 'isDocumentVisible').and.callFake(function () {
          return true;
        });
        return Expect.waitForSpyCall(test.successSpy, test);
      })
        .then(function () {
          expect(RouterUtil.isHostBackgroundChromeTab).toHaveBeenCalled();
          expect(RouterUtil.isDocumentVisible).toHaveBeenCalled();
          expect(document.removeEventListener).toHaveBeenCalled();
          expect(document.addEventListener).toHaveBeenCalled();
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'password',
              provider: 'OKTA',
              profile: {
                password: 'somepassword'
              },
              stateToken: '01testStateToken'
            }
          });
        });
    });

    itp('validates password and confirmPassword cannot be empty', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.submit();
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.hasPasswordFieldErrors()).toBe(true);
        expect(test.form.hasConfirmPasswordFieldErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
        expect(test.form.passwordFieldErrorMessage()).toBe('This field cannot be left blank');
        expect(test.form.confirmPasswordFieldErrorMessage()).toBe('This field cannot be left blank');
        expect($.ajax).not.toHaveBeenCalled();
      });
    });
    itp('validates password and confirmPassword fields match and errors before the request', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.setPassword('somepassword');
        test.form.setConfirmPassword('someotherpassword');
        test.form.submit();
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.hasPasswordFieldErrors()).toBe(false);
        expect(test.form.hasConfirmPasswordFieldErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
        expect(test.form.confirmPasswordFieldErrorMessage()).toBe('Passwords must match');
        expect($.ajax).not.toHaveBeenCalled();
      });
    });
    itp('shows error if error response on enrollment', function () {
      return setup()
        .then(function (test) {
          Q.stopUnhandledRejectionTracking();
          test.setNextResponse(resError);
          test.form.setPassword('somepassword');
          test.form.setConfirmPassword('somepassword');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.hasPasswordFieldErrors()).toBe(true);
          expect(test.form.hasConfirmPasswordFieldErrors()).toBe(false);
          expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
          expect(test.form.passwordFieldErrorMessage()).toBe('Password cannot be your current password');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'enroll-password'
            },
            {
              name: 'AuthApiError',
              message: 'Api validation failed: password',
              statusCode: 400,
              xhr: {
                status: 400,
                responseType: 'json',
                responseText: '{"errorCode":"E0000001","errorSummary":"Api validation failed: password","errorLink":"E0000001","errorId":"oaeBoc-R1sUT6GM84vkUNMxSw","errorCauses":[{"errorSummary":"password: Password cannot be your current password"}]}',
                responseJSON: {
                  errorCode: 'E0000001',
                  errorSummary: 'password: Password cannot be your current password',
                  errorLink: 'E0000001',
                  errorId: 'oaeBoc-R1sUT6GM84vkUNMxSw',
                  errorCauses: [{
                    errorSummary: 'password: Password cannot be your current password'
                  }]
                }
              }
            }
          ]);
        });
    });
    itp('returns to factor list when back link is clicked', function () {
      return setup().then(function (test) {
        test.form.backLink().click();
        expect(test.router.navigate.calls.mostRecent().args)
          .toEqual(['signin/enroll', { trigger: true }]);
      });
    });

  });
});
