/* eslint max-params: [2, 15] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/EnrollTokenFactorForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_error',
  'LoginRouter',
  'helpers/xhr/SUCCESS'
],
function (Okta, OktaAuth, LoginUtil, Util, Form, Beacon, Expect, $sandbox,
  resAllFactors, resEnrollError, Router, resSuccess) {

  var { $ } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollSymantecVip', function () {

    function setup (startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': startRouter
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
          router.enrollSymantecVip();
          return Expect.waitForEnrollSymantecVip({
            router: router,
            beacon: new Beacon($sandbox),
            form: new Form($sandbox),
            ac: authClient,
            setNextResponse: setNextResponse,
            afterErrorHandler: afterErrorHandler
          });
        });
    }

    Expect.describe('Header & Footer', function () {
      itp('displays the correct factorBeacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-symantec')).toBe(true);
        });
      });
      itp('has autocomplete off', function () {
        return setup().then(function (test) {
          expect(test.form.getCodeFieldAutocomplete()).toBe('off');
        });
      });
      itp('has a "back" link in the footer', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.backLink());
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
    });

    Expect.describe('Enroll factor', function () {
      itp('has a credentialId text field', function () {
        return setup().then(function (test) {
          Expect.isTextField(test.form.credentialIdField());
        });
      });
      itp('has two text fields for pass codes', function () {
        return setup().then(function (test) {
          Expect.isTextField(test.form.codeField());
          Expect.isTextField(test.form.secondCodeField());
        });
      });
      itp('has a verify button', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.submitButton());
        });
      });
      itp('does not send request and shows error if codes are not entered', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.setCredentialId('Cred_Id');
          test.form.submit();
          expect(test.form.hasErrors()).toBe(true);
          expect($.ajax).not.toHaveBeenCalled();
        });
      });
      itp('shows error in case of an error response', function () {
        return setup()
          .then(function (test) {
            test.setNextResponse(resEnrollError);
            test.form.setCredentialId('Cred_Id');
            test.form.setCode(123);
            test.form.setSecondCode(654);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('Invalid Phone Number.');
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'enroll-symantec'
              },
              {
                name: 'AuthApiError',
                message: 'Api validation failed: factorEnrollRequest',
                statusCode: 400,
                xhr: {
                  status: 400,
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000001","errorSummary":"Api validation failed: factorEnrollRequest","errorLink":"E0000001","errorId":"oaepmWRr7i5TZa2AQv8sNmu6w","errorCauses":[{"errorSummary":"Invalid Phone Number."}]}',
                  responseJSON: {
                    'errorCode': 'E0000001',
                    'errorSummary': 'Invalid Phone Number.',
                    'errorLink': 'E0000001',
                    'errorId': 'oaepmWRr7i5TZa2AQv8sNmu6w',
                    'errorCauses': [{
                      'errorSummary': 'Invalid Phone Number.'
                    }]
                  }
                }
              }
            ]);
          });
      });
      itp('calls activate with the right params', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.setCredentialId('Cred_Id');
          test.form.setCode(123456);
          test.form.setSecondCode(654321);
          test.setNextResponse(resSuccess);
          test.form.submit();
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'token',
              provider: 'SYMANTEC',
              passCode: '123456',
              nextPassCode: '654321',
              profile: {credentialId: 'Cred_Id'},
              stateToken: 'testStateToken'
            }
          });
        });
      });
    });

  });
});
