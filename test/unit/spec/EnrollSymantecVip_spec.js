/* eslint max-params: [2, 15] */
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollTokenFactorForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resEnrollError from 'helpers/xhr/MFA_ENROLL_ACTIVATE_error';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;

Expect.describe('EnrollSymantecVip', function() {
  function setup(startRouter) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
    });
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      'features.router': startRouter,
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
      afterErrorHandler: afterErrorHandler,
    };

    const enrollSymantecVip = test => {
      setNextResponse(resAllFactors);
      router.refreshAuthState('dummy-token');
      return Expect.waitForEnrollChoices(test).then(function(test) {
        router.enrollSymantecVip();
        return Expect.waitForEnrollSymantecVip(test);
      });
    };

    if (startRouter) {
      return Expect.waitForPrimaryAuth(test).then(enrollSymantecVip);
    } else {
      return enrollSymantecVip(test);
    }
  }

  Expect.describe('Header & Footer', function() {
    itp('displays the correct factorBeacon', function() {
      return setup().then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-symantec')).toBe(true);
      });
    });
    itp('has autocomplete off', function() {
      return setup().then(function(test) {
        expect(test.form.getCodeFieldAutocomplete()).toBe('off');
      });
    });
    itp('has a "back" link in the footer', function() {
      return setup().then(function(test) {
        Expect.isVisible(test.form.backLink());
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
  });

  Expect.describe('Enroll factor', function() {
    itp('has a credentialId text field', function() {
      return setup().then(function(test) {
        Expect.isTextField(test.form.credentialIdField());
      });
    });
    itp('has two text fields for pass codes', function() {
      return setup().then(function(test) {
        Expect.isTextField(test.form.codeField());
        Expect.isTextField(test.form.secondCodeField());
      });
    });
    itp('has a verify button', function() {
      return setup().then(function(test) {
        Expect.isVisible(test.form.submitButton());
      });
    });
    itp('does not send request and shows error if codes are not entered', function() {
      return setup().then(function(test) {
        Util.resetAjaxRequests();
        test.form.setCredentialId('Cred_Id');
        test.form.submit();
        expect(test.form.hasErrors()).toBe(true);
        expect(Util.numAjaxRequests()).toBe(0);
      });
    });
    itp('shows error in case of an error response', function() {
      return setup()
        .then(function(test) {
          test.setNextResponse(resEnrollError);
          test.form.setCredentialId('Cred_Id');
          test.form.setCode(123);
          test.form.setSecondCode(654);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'enroll-symantec',
            },
            {
              name: 'AuthApiError',
              message: 'Api validation failed: factorEnrollRequest',
              statusCode: 400,
              xhr: {
                status: 400,
                headers: { 'content-type': 'application/json' },
                responseType: 'json',
                responseText: '{"errorCode":"E0000001","errorSummary":"Api validation failed: factorEnrollRequest","errorLink":"E0000001","errorId":"oaepmWRr7i5TZa2AQv8sNmu6w","errorCauses":[{"errorSummary":"Invalid Phone Number."}]}',
                responseJSON: {
                  errorCode: 'E0000001',
                  errorSummary: 'Invalid Phone Number.',
                  errorLink: 'E0000001',
                  errorId: 'oaepmWRr7i5TZa2AQv8sNmu6w',
                  errorCauses: [
                    {
                      errorSummary: 'Invalid Phone Number.',
                    },
                  ],
                },
              },
            },
          ]);
        });
    });
    itp('calls activate with the right params', function() {
      return setup().then(function(test) {
        Util.resetAjaxRequests();
        test.form.setCredentialId('Cred_Id');
        test.form.setCode(123456);
        test.form.setSecondCode(654321);
        test.setNextResponse(resSuccess);
        test.form.submit();
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/factors',
          data: {
            factorType: 'token',
            provider: 'SYMANTEC',
            passCode: '123456',
            nextPassCode: '654321',
            profile: { credentialId: 'Cred_Id' },
            stateToken: 'testStateToken',
          },
        });
      });
    });
  });
});
