/* eslint max-params: [2, 18] */
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollPasswordForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resAllFactors from 'helpers/xhr/FACTOR_ENROLL_allFactors';
import resError from 'helpers/xhr/FACTOR_ENROLL_password_error';
import resSuccess from 'helpers/xhr/SUCCESS';
import Q from 'q';
import $sandbox from 'sandbox';
import RouterUtil from 'util/RouterUtil';
import LoginUtil from 'util/Util';
const itp = Expect.itp;

Expect.describe('EnrollPassword', function() {
  function setup(startRouter) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
    });
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const successSpy = jasmine.createSpy('success');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      'features.router': startRouter,
      globalSuccessFn: successSpy,
    });

    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);

    const test = {
      router: router,
      beacon: new Beacon($sandbox),
      form: new Form($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy,
      afterErrorHandler: afterErrorHandler,
    };

    const enrollPassword = test => {
      setNextResponse(resAllFactors);
      router.refreshAuthState('dummy-token');
      return Expect.waitForEnrollChoices(test).then(function(test) {
        router.enrollPassword();
        return Expect.waitForEnrollPassword(test);
      });
    };

    if (startRouter) {
      return Expect.waitForPrimaryAuth(test).then(enrollPassword);
    } else {
      return enrollPassword(test);
    }
  }

  itp('displays the correct factorBeacon', function() {
    return setup().then(function(test) {
      expect(test.beacon.isFactorBeacon()).toBe(true);
      expect(test.beacon.hasClass('mfa-okta-password')).toBe(true);
    });
  });
  itp('does not allow autocomplete', function() {
    return setup().then(function(test) {
      expect(test.form.getPasswordAutocomplete()).toBe('off');
      expect(test.form.getConfirmPasswordAutocomplete()).toBe('off');
    });
  });
  itp('has a password field', function() {
    return setup().then(function(test) {
      const password = test.form.passwordField();

      expect(password.length).toBe(1);
      expect(password.attr('type')).toEqual('password');
    });
  });
  itp('has a confirm password field', function() {
    return setup().then(function(test) {
      const confirmPassword = test.form.confirmPasswordField();

      expect(confirmPassword.length).toBe(1);
      expect(confirmPassword.attr('type')).toEqual('password');
    });
  });
  itp('returns to factor list when browser\'s back button is clicked', function() {
    return setup(true)
      .then(function(test) {
        Util.triggerBrowserBackButton();
        return Expect.waitForEnrollChoices(test);
      })
      .then(function(test) {
        Expect.isEnrollChoices(test.router.controller);
        Util.stopRouter();
      });
  });

  itp('calls enroll with the right arguments when save is clicked', function() {
    return setup(false)
      .then(function(test) {
        Util.resetAjaxRequests();
        test.form.setPassword('somepassword');
        test.form.setConfirmPassword('somepassword');
        test.setNextResponse(resSuccess);
        spyOn(RouterUtil, 'isHostBackgroundChromeTab').and.callFake(function() {
          return true;
        });
        spyOn(document, 'addEventListener').and.callFake(function(type, fn) {
          fn();
        });
        spyOn(document, 'removeEventListener').and.callThrough();
        test.form.submit();

        spyOn(RouterUtil, 'isDocumentVisible').and.callFake(function() {
          return true;
        });
        return Expect.waitForSpyCall(test.successSpy, test);
      })
      .then(function() {
        expect(RouterUtil.isHostBackgroundChromeTab).toHaveBeenCalled();
        expect(RouterUtil.isDocumentVisible).toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled();
        expect(document.addEventListener).toHaveBeenCalled();
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'password',
            provider: 'OKTA',
            profile: {
              password: 'somepassword',
            },
            stateToken: '01testStateToken',
          },
        });
      });
  });

  itp('validates password and confirmPassword cannot be empty', function() {
    return setup().then(function(test) {
      Util.resetAjaxRequests();
      test.form.submit();
      expect(test.form.hasErrors()).toBe(true);
      expect(test.form.hasPasswordFieldErrors()).toBe(true);
      expect(test.form.hasConfirmPasswordFieldErrors()).toBe(true);
      expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
      expect(test.form.passwordFieldErrorMessage()).toBe('This field cannot be left blank');
      expect(test.form.confirmPasswordFieldErrorMessage()).toBe('This field cannot be left blank');
      expect(Util.numAjaxRequests()).toBe(0);
    });
  });
  itp('validates password and confirmPassword fields match and errors before the request', function() {
    return setup().then(function(test) {
      Util.resetAjaxRequests();
      test.form.setPassword('somepassword');
      test.form.setConfirmPassword('someotherpassword');
      test.form.submit();
      expect(test.form.hasErrors()).toBe(true);
      expect(test.form.hasPasswordFieldErrors()).toBe(false);
      expect(test.form.hasConfirmPasswordFieldErrors()).toBe(true);
      expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
      expect(test.form.confirmPasswordFieldErrorMessage()).toBe('Passwords must match');
      expect(Util.numAjaxRequests()).toBe(0);
    });
  });
  itp('shows error if error response on enrollment', function() {
    return setup()
      .then(function(test) {
        Q.stopUnhandledRejectionTracking();
        test.setNextResponse(resError);
        test.form.setPassword('somepassword');
        test.form.setConfirmPassword('somepassword');
        test.form.submit();
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.hasPasswordFieldErrors()).toBe(true);
        expect(test.form.hasConfirmPasswordFieldErrors()).toBe(false);
        expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
        expect(test.form.passwordFieldErrorMessage()).toBe('Password cannot be your current password');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'enroll-password',
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
                errorCauses: [
                  {
                    errorSummary: 'password: Password cannot be your current password',
                  },
                ],
              },
            },
          },
        ]);
      });
  });
  itp('returns to factor list when back link is clicked', function() {
    return setup().then(function(test) {
      test.form.backLink().click();
      expect(test.router.navigate.calls.mostRecent().args).toEqual(['signin/enroll', { trigger: true }]);
    });
  });
});
