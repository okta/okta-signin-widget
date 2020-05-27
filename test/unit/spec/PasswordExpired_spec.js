/* eslint max-params: [2, 19] */
define([
  'okta',
  '@okta/okta-auth-js',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/PasswordExpiredForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/PASSWORD_WARN',
  'helpers/xhr/PASSWORD_EXPIRED',
  'helpers/xhr/PASSWORD_EXPIRED_error_complexity',
  'helpers/xhr/PASSWORD_EXPIRED_error_oldpass',
  'helpers/xhr/CUSTOM_PASSWORD_WARN',
  'helpers/xhr/CUSTOM_PASSWORD_EXPIRED',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/CANCEL'
],
function (Okta, OktaAuth, LoginUtil, Util, PasswordExpiredForm, Beacon, Expect, Router,
  $sandbox, resPassWarn, resPassExpired, resErrorComplexity,
  resErrorOldPass, resCustomPassWarn, resCustomPassExpired, resSuccess, resCancel) {

  var { _ } = Okta;
  var SharedUtil = Okta.internal.util.Util;
  var itp = Expect.itp;

  function deepClone (res) {
    return JSON.parse(JSON.stringify(res));
  }

  function setup (settings, res, custom) {
    settings || (settings = {});
    var successSpy = jasmine.createSpy('successSpy');
    var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      features: {
        securityImage: true,
        customExpiredPassword: custom
      },
      authClient: authClient,
      globalSuccessFn: successSpy,
      processCreds: settings.processCreds
    }, settings));
    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(res || resPassExpired);
    router.refreshAuthState('dummy-token');
    settings = {
      router: router,
      successSpy: successSpy,
      beacon: new Beacon($sandbox),
      form: new PasswordExpiredForm($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse,
      afterErrorHandler: afterErrorHandler
    };
    if (custom) {
      return Expect.waitForCustomPasswordExpired(settings);
    }
    return Expect.waitForPasswordExpired(settings);
  }

  function setupWarn (numDays, settings) {
    resPassWarn.response._embedded.policy.expiration.passwordExpireDays = numDays;
    return setup(settings, resPassWarn);
  }

  function setupCustomExpiredPassword (settings, res) {
    return setup(settings, res || resCustomPassExpired, true);
  }

  function setupCustomExpiredPasswordWarn (numDays, settings) {
    resCustomPassWarn.response._embedded.policy.expiration.passwordExpireDays = numDays;
    return setupCustomExpiredPassword(settings, resCustomPassWarn);
  }

  function submitNewPass (test, oldPass, newPass, confirmPass) {
    test.form.setOldPass(oldPass);
    test.form.setNewPass(newPass);
    test.form.setConfirmPass(confirmPass);
    test.form.submit();
  }

  function setupExcludeAttributes (excludeAttributesArray, showPasswordRequirementsAsHtmlList = false) {
    var passwordExpiredResponse = deepClone(resPassExpired);
    var policyComplexity = passwordExpiredResponse.response._embedded.policy.complexity;
    policyComplexity.excludeAttributes = excludeAttributesArray;
    return setup({ 'features.showPasswordRequirementsAsHtmlList': showPasswordRequirementsAsHtmlList }, passwordExpiredResponse, null);
  }

  Expect.describe('PasswordExpiration', function () {

    Expect.describe('PasswordExpired', function () {
      itp('shows security beacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
      itp('has the correct title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toBe('Your password has expired');
        });
      });
      itp('has the correct title if config has a brandName', function () {
        return setup({ brandName: 'Spaghetti Inc.' }).then(function (test) {
          expect(test.form.titleText()).toBe('Your Spaghetti Inc. password has expired');
        });
      });
      itp('has a valid subtitle', function () {
        return setup().then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username,' +
            ' does not include your first name, does not include your last name.');
        });
      });
      itp('has a valid subtitle if only excludeAttributes["firstName"] is defined', function () {
        return setupExcludeAttributes(['firstName']).then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username,' +
            ' does not include your first name.');
        });
      });
      itp('has a valid subtitle if only excludeAttributes["lastName"] is defined', function () {
        return setupExcludeAttributes(['lastName']).then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username,' +
            ' does not include your last name.');
        });
      });
      itp('has a valid subtitle if only excludeAttributes[] is defined', function () {
        return setupExcludeAttributes([]).then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username.');
        });
      });

      Expect.describe('Password description in HTML', function () {
        itp('does not have a subtitle if password requirements as HTML FF is on', function () {
          return setup({ 'features.showPasswordRequirementsAsHtmlList': true }).then(function (test) {
            expect(test.form.subtitle().length).toEqual(0);
          });
        });
        itp('shows password requirements as HTML list if FF is on', function () {
          return setup({ 'features.showPasswordRequirementsAsHtmlList': true }).then(function (test) {
            expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
            expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(8);
            expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('At least 8 characters');
            expect(test.form.passwordRequirementsHtmlListItems().eq(1).text()).toEqual('A lowercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(2).text()).toEqual('An uppercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(3).text()).toEqual('A number');
            expect(test.form.passwordRequirementsHtmlListItems().eq(4).text()).toEqual('A symbol');
            expect(test.form.passwordRequirementsHtmlListItems().eq(5).text()).toEqual('No parts of your username');
            expect(test.form.passwordRequirementsHtmlListItems().eq(6).text()).toEqual('Does not include your first name');
            expect(test.form.passwordRequirementsHtmlListItems().eq(7).text()).toEqual('Does not include your last name');
          });
        });
        itp('shows password requirements as HTML list if FF is on and if only excludeAttributes["firstName"] is defined', function () {
          return setupExcludeAttributes(['firstName'], true).then(function (test) {
            expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
            expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(7);
            expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('At least 8 characters');
            expect(test.form.passwordRequirementsHtmlListItems().eq(1).text()).toEqual('A lowercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(2).text()).toEqual('An uppercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(3).text()).toEqual('A number');
            expect(test.form.passwordRequirementsHtmlListItems().eq(4).text()).toEqual('A symbol');
            expect(test.form.passwordRequirementsHtmlListItems().eq(5).text()).toEqual('No parts of your username');
            expect(test.form.passwordRequirementsHtmlListItems().eq(6).text()).toEqual('Does not include your first name');
          });
        });
        itp('shows password requirements as HTML list if FF is on and if only excludeAttributes["lastName"] is defined', function () {
          return setupExcludeAttributes(['lastName'], true).then(function (test) {
            expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
            expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(7);
            expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('At least 8 characters');
            expect(test.form.passwordRequirementsHtmlListItems().eq(1).text()).toEqual('A lowercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(2).text()).toEqual('An uppercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(3).text()).toEqual('A number');
            expect(test.form.passwordRequirementsHtmlListItems().eq(4).text()).toEqual('A symbol');
            expect(test.form.passwordRequirementsHtmlListItems().eq(5).text()).toEqual('No parts of your username');
            expect(test.form.passwordRequirementsHtmlListItems().eq(6).text()).toEqual('Does not include your last name');
          });
        });
        itp('shows password requirements as HTML list if FF is on and if excludeAttributes is empty', function () {
          return setupExcludeAttributes([], true).then(function (test) {
            expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
            expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(6);
            expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('At least 8 characters');
            expect(test.form.passwordRequirementsHtmlListItems().eq(1).text()).toEqual('A lowercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(2).text()).toEqual('An uppercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(3).text()).toEqual('A number');
            expect(test.form.passwordRequirementsHtmlListItems().eq(4).text()).toEqual('A symbol');
            expect(test.form.passwordRequirementsHtmlListItems().eq(5).text()).toEqual('No parts of your username');
          });
        });
      });

      itp('has an old password field', function () {
        return setup().then(function (test) {
          Expect.isPasswordField(test.form.oldPassField());
        });
      });
      itp('has a new password field', function () {
        return setup().then(function (test) {
          Expect.isPasswordField(test.form.newPassField());
        });
      });
      itp('has a confirm password field', function () {
        return setup().then(function (test) {
          Expect.isPasswordField(test.form.confirmPassField());
        });
      });
      itp('has a change password button', function () {
        return setup().then(function (test) {
          expect(test.form.submitButton().length).toBe(1);
        });
      });
      itp('has a sign out link', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.signoutLink());
        });
      });
      itp('does not have a skip link', function () {
        return setup().then(function (test) {
          expect(test.form.skipLink().length).toBe(0);
        });
      });
      itp('has a signout link which cancels the current stateToken and navigates to primaryAuth', function () {
        return setup()
          .then(function (test) {
            spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
            spyOn(SharedUtil, 'redirect');
            Util.resetAjaxRequests();
            test.setNextResponse(resCancel);
            test.form.signout();
            return Expect.waitForAjaxRequest(test);
          })
          .then(test => {
            // `clearLastAuthResponse` will be invoked when response has no `status`
            // see RouterUtil for details
            return Expect.waitForSpyCall(test.router.controller.options.appState.clearLastAuthResponse, test);
          })
          .then(function (test) {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/cancel',
              data: {
                stateToken: 'testStateToken'
              }
            });
            expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
            Expect.isPrimaryAuth(test.router.controller);
          });
      });
      itp('has a signout link which cancels the current stateToken and redirects to the provided signout url',
        function () {
          return setup({ signOutLink: 'http://www.goodbye.com' })
            .then(function (test) {
              spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
              spyOn(SharedUtil, 'redirect');
              Util.resetAjaxRequests();
              test.setNextResponse(resCancel);
              test.form.signout();
              return Expect.waitForAjaxRequest(test);
            })
            .then(test => {
              // `clearLastAuthResponse` will be invoked when response has no `status`
              // see RouterUtil for details
              return Expect.waitForSpyCall(test.router.controller.options.appState.clearLastAuthResponse, test);
            })
            .then(function (test) {
              expect(Util.numAjaxRequests()).toBe(1);
              Expect.isJsonPost(Util.getAjaxRequest(0), {
                url: 'https://foo.com/api/v1/authn/cancel',
                data: {
                  stateToken: 'testStateToken'
                }
              });
              expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
              expect(SharedUtil.redirect).toHaveBeenCalledWith('http://www.goodbye.com');
            });
        });
      itp('calls processCreds function before saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCredsSpy');
        return setup({ processCreds: processCredsSpy })
          .then(function (test) {
            Util.resetAjaxRequests();
            test.setNextResponse(resSuccess);
            submitNewPass(test, 'oldpwd', 'newpwd', 'newpwd');
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect(processCredsSpy.calls.count()).toBe(1);
            expect(processCredsSpy).toHaveBeenCalledWith({
              username: 'inca@clouditude.net',
              password: 'newpwd'
            });
            expect(Util.numAjaxRequests()).toBe(1);
          });
      });
      itp('calls async processCreds function before saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCredsSpy');
        return setup({
          processCreds: function (creds, callback) {
            processCredsSpy(creds, callback);
            callback();
          }
        })
          .then(function (test) {
            Util.resetAjaxRequests();
            test.setNextResponse(resSuccess);
            submitNewPass(test, 'oldpwd', 'newpwd', 'newpwd');
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect(processCredsSpy.calls.count()).toBe(1);
            expect(processCredsSpy).toHaveBeenCalledWith({
              username: 'inca@clouditude.net',
              password: 'newpwd'
            }, jasmine.any(Function));
            expect(Util.numAjaxRequests()).toBe(1);
          });
      });
      itp('calls async processCreds function and can prevent saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCredsSpy');
        return setup({
          processCreds: function (creds, callback) {
            processCredsSpy(creds, callback);
          }
        })
          .then(function (test) {
            Util.resetAjaxRequests();
            test.setNextResponse(resSuccess);
            submitNewPass(test, 'oldpwd', 'newpwd', 'newpwd');
            return Expect.waitForSpyCall(processCredsSpy);
          })
          .then(function () {
            expect(processCredsSpy.calls.count()).toBe(1);
            expect(processCredsSpy).toHaveBeenCalledWith({
              username: 'inca@clouditude.net',
              password: 'newpwd'
            }, jasmine.any(Function));
            expect(Util.numAjaxRequests()).toBe(0);
          });
      });
      itp('saves the new password successfully', function () {
        return setup().then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          submitNewPass(test, 'oldpassyo', 'boopity', 'boopity');
          return Expect.waitForSpyCall(test.successSpy);
        })
          .then(function () {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/credentials/change_password',
              data: {
                oldPassword: 'oldpassyo',
                newPassword: 'boopity',
                stateToken: 'testStateToken'
              }
            });
          });
      });
      itp('makes submit button disable when form is submitted', function () {
        return setup()
          .then(function (test) {
            Util.resetAjaxRequests();
            test.setNextResponse(resSuccess);
            submitNewPass(test, 'oldpass', 'newpass', 'newpass');
            return Expect.waitForSpyCall(test.successSpy, test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).toContain('link-button-disabled');
          });
      });
      itp('makes submit button enabled after error response', function () {
        return setup()
          .then(function (test) {
            Util.resetAjaxRequests();
            test.setNextResponse(resErrorOldPass);
            submitNewPass(test, 'wrongoldpass', 'boo', 'boo');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            var button = test.form.submitButton();
            var buttonClass = button.attr('class');
            expect(buttonClass).not.toContain('link-button-disabled');
          });
      });
      itp('shows an error if the server returns a wrong old pass error', function () {
        return setup()
          .then(function (test) {
            test.setNextResponse(resErrorOldPass);
            submitNewPass(test, 'wrongoldpass', 'boo', 'boo');
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe(
              'Old password is not correct'
            );
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'password-expired'
              },
              {
                name: 'AuthApiError',
                message: 'Update of credentials failed',
                statusCode: 400,
                xhr: {
                  status: 400,
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000014","errorSummary":"Update of credentials failed","errorLink":"E0000014","errorId":"oaecIzifuYzTV-5h3Ea46oxiw","errorCauses":[{"errorSummary":"Old password is not correct"}]}',
                  responseJSON: {
                    errorCode: 'E0000014',
                    errorSummary: 'Old password is not correct',
                    errorLink: 'E0000014',
                    errorId: 'oaecIzifuYzTV-5h3Ea46oxiw',
                    errorCauses: [{
                      errorSummary: 'Old password is not correct'
                    }]
                  }
                }
              }
            ]);
          });
      });
      itp('shows an error if the server returns a complexity error', function () {
        return setup()
          .then(function (test) {
            test.setNextResponse(resErrorComplexity);
            submitNewPass(test, 'oldpassyo', 'badpass', 'badpass');
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe(
              'Password requirements were not met. Password requirements: at least 8 characters,' +
            ' a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username,' +
            ' does not include your first name, does not include your last name.'
            );
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'password-expired'
              },
              {
                name: 'AuthApiError',
                message: 'Update of credentials failed',
                statusCode: 403,
                xhr: {
                  status: 403,
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000014","errorSummary":"Update of credentials failed","errorLink":"E0000014","errorId":"oaeRXeoXe24RWqjj0R-pL03ZA","errorCauses":[{"errorSummary":"Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name."}]}',
                  responseJSON: {
                    errorCode: 'E0000014',
                    errorSummary: 'Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name.',
                    errorLink: 'E0000014',
                    errorId: 'oaeRXeoXe24RWqjj0R-pL03ZA',
                    errorCauses: [{
                      errorSummary: 'Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name.'
                    }]
                  }
                }
              }
            ]);
          });
      });
      itp('shows an simple error if showPasswordRequirementsAsHtmlList is on and if the server returns a complexity error', function () {
        return setup({ 'features.showPasswordRequirementsAsHtmlList': true })
            .then(function (test) {
              test.setNextResponse(resErrorComplexity);
              submitNewPass(test, 'oldpassyo', 'badpass', 'badpass');
              return Expect.waitForFormError(test.form, test);
            })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              expect(test.form.errorMessage()).toBe(
                  'Password requirements were not met.'
              );
              expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
              expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
                {
                  controller: 'password-expired'
                },
                {
                  name: 'AuthApiError',
                  message: 'Update of credentials failed',
                  statusCode: 403,
                  xhr: {
                    status: 403,
                    responseType: 'json',
                    responseText: '{"errorCode":"E0000014","errorSummary":"Update of credentials failed","errorLink":"E0000014","errorId":"oaeRXeoXe24RWqjj0R-pL03ZA","errorCauses":[{"errorSummary":"Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name."}]}',
                    responseJSON: {
                      errorCode: 'E0000014',
                      errorSummary: 'Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name.',
                      errorLink: 'E0000014',
                      errorId: 'oaeRXeoXe24RWqjj0R-pL03ZA',
                      errorCauses: [{
                        errorSummary: 'Password requirements were not met.'
                      }]
                    }
                  }
                }
              ]);
            });
      });
      itp('validates that fields are not empty', function () {
        return setup().then(function (test) {
          Util.resetAjaxRequests();
          test.form.submit();
          expect(Util.numAjaxRequests()).toBe(0);
          expect(test.form.hasErrors()).toBe(true);
          Expect.isEmptyFieldError(test.form.oldPassFieldError());
          Expect.isEmptyFieldError(test.form.newPassFieldError());
          Expect.isEmptyFieldError(test.form.confirmPassFieldError());
        });
      });

      itp('validates that new password is equal to confirm password', function () {
        return setup().then(function (test) {
          Util.resetAjaxRequests();
          submitNewPass(test, 'newpass', 'differentnewpass');
          expect(Util.numAjaxRequests()).toBe(0);
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.confirmPassFieldError().text())
            .toBe('New passwords must match');
        });
      });

    });

    Expect.describe('CustomPasswordExpired', function () {

      itp('shows security beacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
      itp('has the correct title', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.titleText()).toBe('Your password has expired');
        });
      });
      itp('has the correct title if config has a brandName', function () {
        return setupCustomExpiredPassword({ brandName: 'Spaghetti Inc.' }).then(function (test) {
          expect(test.form.titleText()).toBe('Your Spaghetti Inc. password has expired');
        });
      });
      itp('has a valid subtitle', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.subtitleText()).toEqual('This password is set on another website. ' +
              'Click the button below to go there and set a new password.');
        });
      });
      itp('has a custom change password button', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.customButton().length).toBe(1);
        });
      });
      itp('has a valid custom button text', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.customButtonText()).toEqual('Go to Twitter');
        });
      });
      itp('has a sign out link', function () {
        return setupCustomExpiredPassword().then(function (test) {
          Expect.isVisible(test.form.signoutLink());
        });
      });
      itp('does not have a skip link', function () {
        return setupCustomExpiredPassword().then(function (test) {
          expect(test.form.skipLink().length).toBe(0);
        });
      });
      itp('redirect is called with the correct arg on custom button click', function () {
        spyOn(SharedUtil, 'redirect');
        return setupCustomExpiredPassword().then(function (test) {
          test.form.clickCustomButton();
          expect(SharedUtil.redirect).toHaveBeenCalledWith('https://www.twitter.com');
        });
      });

    });

    Expect.describe('PasswordAboutToExpire', function () {

      itp('has the correct title if expiring in > 0 days', function () {
        return setupWarn(4).then(function (test) {
          expect(test.form.titleText()).toBe('Your password will expire in 4 days');
        });
      });
      itp('has the correct title if expiring in 0 days', function () {
        return setupWarn(0).then(function (test) {
          expect(test.form.titleText()).toBe('Your password will expire later today');
        });
      });
      itp('has the correct title if numDays is null', function () {
        return setupWarn(null).then(function (test) {
          expect(test.form.titleText()).toBe('Your password is expiring soon');
        });
      });
      itp('has the correct title if numDays is undefined', function () {
        return setupWarn(undefined).then(function (test) {
          expect(test.form.titleText()).toBe('Your password is expiring soon');
        });
      });
      itp('has the correct subtitle', function () {
        return setupWarn(4).then(function (test) {
          expect(test.form.subtitleText()).toBe('When password expires you will be locked out of your account.');
        });
      });
      itp('has the correct subtitle if config has a brandName', function () {
        return setupWarn(4, { brandName: 'Spaghetti Inc.' }).then(function (test) {
          expect(test.form.subtitleText()).toBe('When password expires you will be locked out of your Spaghetti Inc. account.');
        });
      });
      itp('has a sign out link', function () {
        return setupWarn(4).then(function (test) {
          Expect.isVisible(test.form.signoutLink());
        });
      });
      itp('has a skip link', function () {
        return setupWarn(4).then(function (test) {
          Expect.isVisible(test.form.skipLink());
        });
      });
      itp('goToLink is called with the correct args on skip', function () {
        return setupWarn(4).then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          test.form.skip();
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/skip',
            data: {
              stateToken: 'testStateToken'
            }
          });
        });
      });
      itp('goToLink is called with the correct args on sign out', function () {
        return setupWarn(4).then(function (test) {
          spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
          Util.resetAjaxRequests();
          test.setNextResponse(resCancel);
          test.form.signout();
          return Expect.waitForPrimaryAuth(test);
        })
          .then(function (test) {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.getAjaxRequest(0), {
              url: 'https://foo.com/api/v1/authn/cancel',
              data: {
                stateToken: 'testStateToken'
              }
            });
            expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
            Expect.isPrimaryAuth(test.router.controller);
          });
      });

    });

    Expect.describe('CustomPasswordAboutToExpire', function () {

      itp('shows security beacon', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
      itp('has the correct title if expiring in > 0 days', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.form.titleText()).toBe('Your password will expire in 4 days');
        });
      });
      itp('has the correct title if expiring in 0 days', function () {
        return setupCustomExpiredPasswordWarn(0).then(function (test) {
          expect(test.form.titleText()).toBe('Your password will expire later today');
        });
      });
      itp('has the correct title if numDays is null', function () {
        return setupCustomExpiredPasswordWarn(null).then(function (test) {
          expect(test.form.titleText()).toBe('Your password is expiring soon');
        });
      });
      itp('has the correct title if numDays is undefined', function () {
        return setupCustomExpiredPasswordWarn(undefined).then(function (test) {
          expect(test.form.titleText()).toBe('Your password is expiring soon');
        });
      });
      itp('has a valid subtitle', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.form.subtitleText()).toEqual('When password expires you will be locked out of your account. ' +
              'This password is set on another website. ' +
              'Click the button below to go there and set a new password.');
        });
      });
      itp('has a valid subtitle if config has a brandName', function () {
        return setupCustomExpiredPasswordWarn(4, { brandName: 'Spaghetti Inc.' }).then(function (test) {
          expect(test.form.subtitleText()).toEqual('When password expires you will be locked out of your Spaghetti Inc. account. ' +
              'This password is set on another website. ' +
              'Click the button below to go there and set a new password.');
        });
      });
      itp('has a custom change password button', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.form.customButton().length).toBe(1);
        });
      });
      itp('has a valid custom button text', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          expect(test.form.customButtonText()).toEqual('Go to Google');
        });
      });
      itp('has a sign out link', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          Expect.isVisible(test.form.signoutLink());
        });
      });
      itp('has a skip link', function () {
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          Expect.isVisible(test.form.skipLink());
        });
      });
      itp('redirect is called with the correct arg on custom button click', function () {
        spyOn(SharedUtil, 'redirect');
        return setupCustomExpiredPasswordWarn(4).then(function (test) {
          test.form.clickCustomButton();
          expect(SharedUtil.redirect).toHaveBeenCalledWith('https://www.google.com');
        });
      });

    });

  });
});
