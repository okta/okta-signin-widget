define([
  'q',
  'okta',
  '@okta/okta-auth-js',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/PasswordResetForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/PASSWORD_RESET',
  'helpers/xhr/PASSWORD_RESET_withComplexity',
  'helpers/xhr/PASSWORD_RESET_error',
  'helpers/xhr/200',
  'helpers/xhr/SUCCESS'
],
function (Q, Okta, OktaAuth, LoginUtil, Util, PasswordResetForm, Beacon, Expect, Router,
  $sandbox, resPasswordReset, resPasswordResetWithComplexity, resError, res200, resSuccess) {

  var { _ } = Okta;
  var SharedUtil = Okta.internal.util.Util;
  var itp = Expect.itp;

  function deepClone (res) {
    return JSON.parse(JSON.stringify(res));
  }

  function setup (settings) {
    settings || (settings = {});
    var successSpy = jasmine.createSpy('successSpy');
    var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    var passwordResetResponse = resPasswordReset;
    var policyComplexityDefaults = {
      minLength: 8,
      minLowerCase: 1,
      minUpperCase: 1,
      minNumber: 1,
      minSymbol: 1,
      excludeUsername: true,
      excludeAttributes: getExcludeAttributes(settings.excludeAttributes)
    };

    var policyAgeMinAge = {
      inMinutes: 30,
      inHours: 120,
      inDays: 2880
    };

    var policyAgeDefaults = {
      historyCount: 7,
      minAgeMinutes: policyAgeMinAge.inMinutes
    };

    if (settings && (settings.policyComplexity || settings.policyAge)) {
      passwordResetResponse = deepClone(resPasswordResetWithComplexity);
      var responsePolicy = passwordResetResponse.response._embedded.policy;

      if (settings.policyComplexity === 'all') {
        responsePolicy.complexity = policyComplexityDefaults;
      } else if (settings.policyComplexity) {
        var policyKey = settings.policyComplexity;
        responsePolicy.complexity[policyKey] = policyComplexityDefaults[policyKey];
      }
      delete settings.policyComplexity;

      if (settings.policyAge === 'all') {
        responsePolicy.age = policyAgeDefaults;
      } else if (settings.policyAge) {
        var ageKey = settings.policyAge;
        responsePolicy.age[ageKey] = policyAgeDefaults[ageKey];
      }

      // test when enough minutes for hours
      if (settings.policyAge === 'minAgeMinutesinHours') {
        responsePolicy.age.minAgeMinutes = policyAgeMinAge.inHours;
      }
      // test when enough minutes for days
      if (settings.policyAge === 'minAgeMinutesinDays') {
        responsePolicy.age.minAgeMinutes = policyAgeMinAge.inDays;
      }
      delete settings.policyAge;
    }

    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy,
      processCreds: settings.processCreds
    }, settings));
    var form = new PasswordResetForm($sandbox);
    var beacon = new Beacon($sandbox);
    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(passwordResetResponse);
    router.refreshAuthState('dummy-token');
    return Expect.waitForPasswordReset({
      router: router,
      successSpy: successSpy,
      form: form,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      afterErrorHandler: afterErrorHandler
    });
  }

  function getExcludeAttributes (excludeAttributes) {
    return excludeAttributes || ['firstName', 'lastName'];
  }

  Expect.describe('PasswordReset', function () {
    itp('displays the security beacon if enabled', function () {
      return setup({ 'features.securityImage': true }).then(function (test) {
        expect(test.beacon.isSecurityBeacon()).toBe(true);
      });
    });

    itp('has a signout link which cancels the current stateToken and navigates to primaryAuth', function () {
      return setup()
        .then(function (test) {
          spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
          Util.resetAjaxRequests();
          test.setNextResponse(res200);
          var $link = test.form.signoutLink();
          expect($link.length).toBe(1);
          $link.click();
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

    itp('does not show back link if hideBackToSignInForReset is true', function () {
      return setup({ 'features.hideBackToSignInForReset': true })
        .then(function (test) {
          var $link = test.form.signoutLink();
          expect($link.length).toBe(0);
        });
    });

    itp('has a signout link which cancels the current stateToken and redirects to the provided signout url',
      function () {
        return setup({ signOutLink: 'http://www.goodbye.com' })
          .then(function (test) {
            spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
            spyOn(SharedUtil, 'redirect');
            Util.resetAjaxRequests();
            test.setNextResponse(res200);
            var $link = test.form.signoutLink();
            expect($link.length).toBe(1);
            $link.click();
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

    itp('has a valid subtitle if NO password complexity defined', function () {
      return setup().then(function (test) {
        expect(test.form.subtitleText()).toEqual('');
      });
    });

    itp('has a valid subtitle if only password complexity "minLength" defined', function () {
      return setup({policyComplexity: 'minLength'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters.');
      });
    });

    itp('has a valid subtitle if only password complexity "minLowerCase" defined', function () {
      return setup({policyComplexity: 'minLowerCase'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: a lowercase letter.');
      });
    });

    itp('has a valid subtitle if only password complexity "minUpperCase" defined', function () {
      return setup({policyComplexity: 'minUpperCase'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: an uppercase letter.');
      });
    });

    itp('has a valid subtitle if only password complexity "minNumber" defined', function () {
      return setup({policyComplexity: 'minNumber'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: a number.');
      });
    });

    itp('has a valid subtitle if only password complexity "minSymbol" defined', function () {
      return setup({policyComplexity: 'minSymbol'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: a symbol.');
      });
    });

    itp('has a valid subtitle if only password complexity "excludeUsername" defined', function () {
      return setup({policyComplexity: 'excludeUsername'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: no parts of your username.');
      });
    });

    itp('has a valid subtitle if only excludeAttributes["firstName","lastName"] is defined', function () {
      return setup({policyComplexity: 'excludeAttributes'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: does not include your first name,' +
        ' does not include your last name.');
      });
    });

    itp('has a valid subtitle if only excludeAttributes["firstName"] is defined', function () {
      return setup({policyComplexity: 'excludeAttributes', excludeAttributes: ['firstName']}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: does not include your first name.');
      });
    });

    itp('has a valid subtitle if only excludeAttributes["lastName"] is defined', function () {
      return setup({policyComplexity: 'excludeAttributes', excludeAttributes: ['lastName']}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: does not include your last name.');
      });
    });

    itp('has a valid subtitle if only excludeAttributes[] is defined', function () {
      return setup({policyComplexity: 'all', excludeAttributes: []}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters, a lowercase letter,' +
          ' an uppercase letter, a number, a symbol, no parts of your username.');
      });
    });

    itp('has a valid subtitle if only password age "historyCount" defined', function () {
      return setup({policyAge: 'historyCount'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Your password cannot be any of your last 7 passwords.');
      });
    });

    itp('has a valid subtitle in minutes if only password age "minAgeMinutes" defined', function () {
      return setup({policyAge: 'minAgeMinutes'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual(
          'At least 30 minute(s) must have elapsed since you last changed your password.');
      });
    });

    itp('has a valid subtitle in hours if only password age "minAgeMinutesinHours" defined', function () {
      return setup({policyAge: 'minAgeMinutesinHours'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual(
          'At least 2 hour(s) must have elapsed since you last changed your password.');
      });
    });

    itp('has a valid subtitle in days if only password age "minAgeMinutesinDays" defined', function () {
      return setup({policyAge: 'minAgeMinutesinDays'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual(
          'At least 2 day(s) must have elapsed since you last changed your password.');
      });
    });

    itp('has a valid subtitle if password complexity "excludeUsername" and password age "historyCount" defined',
      function () {
        return setup({policyComplexity: 'excludeUsername', policyAge: 'historyCount'}).then(function (test) {
          expect(test.form.subtitleText()).toEqual('Password requirements: no parts of your username.' +
            ' Your password cannot be any of your last 7 passwords.');
        });
      }
    );

    itp('has a valid subtitle if password complexity is defined with all options', function () {
      return setup({policyComplexity: 'all'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual('Password requirements: at least 8 characters, a lowercase letter,' +
          ' an uppercase letter, a number, a symbol, no parts of your username,' +
          ' does not include your first name, does not include your last name.');
      });
    });

    itp('has a valid subtitle in minutes if password age is defined with all options', function () {
      return setup({policyAge: 'all'}).then(function (test) {
        expect(test.form.subtitleText()).toEqual(
          'Your password cannot be any of your last 7 passwords.' +
            ' At least 30 minute(s) must have elapsed since you last changed your password.');
      });
    });

    itp('has a valid subtitle if password complexity is defined with all options and password age "historyCount" defined',
      function () {
        return setup({policyComplexity: 'all', policyAge: 'historyCount'}).then(function (test) {
          expect(test.form.subtitleText())
            .toEqual('Password requirements: at least 8 characters, a lowercase letter,' +
            ' an uppercase letter, a number, a symbol, no parts of your username,' +
            ' does not include your first name, does not include your last name.' +
            ' Your password cannot be any of your last 7 passwords.');
        });
      });

    itp('has a valid subtitle if password age and complexity are defined with all options', function () {
      return setup({policyComplexity: 'all', policyAge: 'all'}).then(function (test) {
        expect(test.form.subtitleText())
          .toEqual('Password requirements: at least 8 characters, a lowercase letter,' +
          ' an uppercase letter, a number, a symbol, no parts of your username,' +
          ' does not include your first name, does not include your last name.' +
          ' Your password cannot be any of your last 7 passwords.' +
          ' At least 30 minute(s) must have elapsed since you last changed your password.');
      });
    });

    Expect.describe('Password description in HTML', function () {
      itp('does not have subtitle', function () {
        return setup({ 'features.showPasswordRequirementsAsHtmlList': true }).then(function (test) {
          expect(test.form.subtitle().length).toEqual(0);
        });
      });

      itp('has a valid subtitle if only password complexity "minLength" defined', function () {
        return setup({
          policyComplexity: 'minLength',
          'features.showPasswordRequirementsAsHtmlList': true
        }).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('At least 8 characters');
        });
      });

      itp('has a valid subtitle if only password complexity "minLowerCase" defined', function () {
        return setup({
          policyComplexity: 'minLowerCase',
          'features.showPasswordRequirementsAsHtmlList': true
        }).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('A lowercase letter');
        });
      });

      itp('has a valid subtitle if only password complexity "minUpperCase" defined', function () {
        return setup({policyComplexity: 'minUpperCase', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('An uppercase letter');
        });
      });

      itp('has a valid subtitle if only password complexity "minNumber" defined', function () {
        return setup({policyComplexity: 'minNumber', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('A number');
        });
      });

      itp('has a valid subtitle if only password complexity "minSymbol" defined', function () {
        return setup({policyComplexity: 'minSymbol', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('A symbol');
        });
      });

      itp('has a valid subtitle if only password complexity "excludeUsername" defined', function () {
        return setup({policyComplexity: 'excludeUsername', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('No parts of your username');
        });
      });

      itp('has a valid subtitle if only excludeAttributes["firstName","lastName"] is defined', function () {
        return setup({policyComplexity: 'excludeAttributes', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(2);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('Does not include your first name');
          expect(test.form.passwordRequirementsHtmlListItems().eq(1).text()).toEqual('Does not include your last name');
        });
      });

      itp('has a valid subtitle if only excludeAttributes["firstName"] is defined', function () {
        return setup({
          policyComplexity: 'excludeAttributes',
          excludeAttributes: ['firstName'],
          'features.showPasswordRequirementsAsHtmlList': true
        }).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('Does not include your first name');
        });
      });

      itp('has a valid subtitle if only excludeAttributes["lastName"] is defined', function () {
        return setup({
          policyComplexity: 'excludeAttributes',
          excludeAttributes: ['lastName'],
          'features.showPasswordRequirementsAsHtmlList': true
        }).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('Does not include your last name');
        });
      });

      itp('has a valid subtitle if only excludeAttributes[] is defined', function () {
        return setup({
          policyComplexity: 'all',
          excludeAttributes: [],
          'features.showPasswordRequirementsAsHtmlList': true
        }).then(function (test) {
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

      itp('has a valid subtitle if only password age "historyCount" defined', function () {
        return setup({policyAge: 'historyCount', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text())
            .toEqual('Your password cannot be any of your last 7 passwords');
        });
      });

      itp('has a valid subtitle in minutes if only password age "minAgeMinutes" defined', function () {
        return setup({policyAge: 'minAgeMinutes', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text())
            .toEqual('At least 30 minute(s) must have elapsed since you last changed your password');
        });
      });

      itp('has a valid subtitle in hours if only password age "minAgeMinutesinHours" defined', function () {
        return setup({policyAge: 'minAgeMinutesinHours', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text())
            .toEqual('At least 2 hour(s) must have elapsed since you last changed your password');
        });
      });

      itp('has a valid subtitle in days if only password age "minAgeMinutesinDays" defined', function () {
        return setup({policyAge: 'minAgeMinutesinDays', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(1);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text())
            .toEqual('At least 2 day(s) must have elapsed since you last changed your password');
        });
      });

      itp('has a valid subtitle if password complexity "excludeUsername" and password age "historyCount" defined',
        function () {
          return setup({
            policyComplexity: 'excludeUsername',
            policyAge: 'historyCount',
            'features.showPasswordRequirementsAsHtmlList': true
          }).then(function (test) {
            expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
            expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(2);
            expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('No parts of your username');
            expect(test.form.passwordRequirementsHtmlListItems().eq(1).text())
              .toEqual('Your password cannot be any of your last 7 passwords');
          });
        }
      );

      itp('has a valid subtitle if password complexity is defined with all options', function () {
        return setup({policyComplexity: 'all', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
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

      itp('has a valid subtitle in minutes if password age is defined with all options', function () {
        return setup({policyAge: 'all', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(2);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('Your password cannot be any of your last 7 passwords');
          expect(test.form.passwordRequirementsHtmlListItems().eq(1).text()).toEqual('At least 30 minute(s) must have elapsed since you last changed your password');
        });
      });

      itp('has a valid subtitle if password complexity is defined with all options and password age "historyCount" defined',
        function () {
          return setup({
            policyComplexity: 'all',
            policyAge: 'historyCount',
            'features.showPasswordRequirementsAsHtmlList': true
          }).then(function (test) {
            expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
            expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(9);
            expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('At least 8 characters');
            expect(test.form.passwordRequirementsHtmlListItems().eq(1).text()).toEqual('A lowercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(2).text()).toEqual('An uppercase letter');
            expect(test.form.passwordRequirementsHtmlListItems().eq(3).text()).toEqual('A number');
            expect(test.form.passwordRequirementsHtmlListItems().eq(4).text()).toEqual('A symbol');
            expect(test.form.passwordRequirementsHtmlListItems().eq(5).text()).toEqual('No parts of your username');
            expect(test.form.passwordRequirementsHtmlListItems().eq(6).text()).toEqual('Does not include your first name');
            expect(test.form.passwordRequirementsHtmlListItems().eq(7).text()).toEqual('Does not include your last name');
            expect(test.form.passwordRequirementsHtmlListItems().eq(8).text()).toEqual('Your password cannot be any of your last 7 passwords');
          });
        });

      itp('has a valid subtitle if password age and complexity are defined with all options', function () {
        return setup({policyComplexity: 'all', policyAge: 'all', 'features.showPasswordRequirementsAsHtmlList': true}).then(function (test) {
          expect(test.form.passwordRequirementsHtmlHeader().trimmedText()).toEqual('Password requirements:');
          expect(test.form.passwordRequirementsHtmlListItems().length).toEqual(10);
          expect(test.form.passwordRequirementsHtmlListItems().eq(0).text()).toEqual('At least 8 characters');
          expect(test.form.passwordRequirementsHtmlListItems().eq(1).text()).toEqual('A lowercase letter');
          expect(test.form.passwordRequirementsHtmlListItems().eq(2).text()).toEqual('An uppercase letter');
          expect(test.form.passwordRequirementsHtmlListItems().eq(3).text()).toEqual('A number');
          expect(test.form.passwordRequirementsHtmlListItems().eq(4).text()).toEqual('A symbol');
          expect(test.form.passwordRequirementsHtmlListItems().eq(5).text()).toEqual('No parts of your username');
          expect(test.form.passwordRequirementsHtmlListItems().eq(6).text()).toEqual('Does not include your first name');
          expect(test.form.passwordRequirementsHtmlListItems().eq(7).text()).toEqual('Does not include your last name');
          expect(test.form.passwordRequirementsHtmlListItems().eq(8).text()).toEqual('Your password cannot be any of your last 7 passwords');
          expect(test.form.passwordRequirementsHtmlListItems().eq(9).text()).toEqual('At least 30 minute(s) must have elapsed since you last changed your password');
        });
      });
    });

    itp('has a password field to enter the new password', function () {
      return setup().then(function (test) {
        Expect.isPasswordField(test.form.newPasswordField());
      });
    });

    itp('has a password field to confirm the new password', function () {
      return setup().then(function (test) {
        Expect.isPasswordField(test.form.confirmPasswordField());
      });
    });

    itp('calls processCreds function before saving a model', function () {
      var processCredsSpy = jasmine.createSpy('processCredsSpy');
      return setup({ processCreds: processCredsSpy })
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          test.form.setNewPassword('newpwd');
          test.form.setConfirmPassword('newpwd');
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'administrator1@clouditude.net',
            password: 'newpwd'
          });
          expect(Util.numAjaxRequests()).toBe(1);
        });
    });

    itp('calls async processCreds function before saving a model', function () {
      var processCredsSpy = jasmine.createSpy('processCredsSpy');
      return setup({
        'processCreds': function (creds, callback) {
          processCredsSpy(creds, callback);
          callback();
        }
      })
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          test.form.setNewPassword('newpwd');
          test.form.setConfirmPassword('newpwd');
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'administrator1@clouditude.net',
            password: 'newpwd'
          }, jasmine.any(Function));
          expect(Util.numAjaxRequests()).toBe(1);
        });
    });

    itp('calls async processCreds function and can prevent saving a model', function () {
      var processCredsSpy = jasmine.createSpy('processCredsSpy');
      return setup({
        'processCreds': function (creds, callback) {
          processCredsSpy(creds, callback);
        }
      })
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          test.form.setNewPassword('newpwd');
          test.form.setConfirmPassword('newpwd');
          test.form.submit();
          return Expect.waitForSpyCall(processCredsSpy);
        })
        .then(function () {
          expect(processCredsSpy.calls.count()).toBe(1);
          expect(processCredsSpy).toHaveBeenCalledWith({
            username: 'administrator1@clouditude.net',
            password: 'newpwd'
          }, jasmine.any(Function));
          expect(Util.numAjaxRequests()).toBe(0);
        });
    });

    itp('makes the right auth request when form is submitted', function () {
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          test.form.setNewPassword('imsorrymsjackson');
          test.form.setConfirmPassword('imsorrymsjackson');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/credentials/reset_password',
            data: {
              newPassword: 'imsorrymsjackson',
              stateToken: 'testStateToken'
            }
          });
        });
    });

    itp('makes submit button disable when form is submitted', function () {
      var dummySaveEventHnadler = jasmine.createSpy();
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          // Submit form will trigger `save` event and its handler will
          // 'disable' the button. Thus when the `dummySaveEventHnadler`
          // has been invoked, we could reason the `save` event has been
          // fired and could expect the save button shall been disabled.
          test.router.controller.listenTo(
            test.router.controller.model,
            'save',
            dummySaveEventHnadler);
          test.form.setNewPassword('pwd');
          test.form.setConfirmPassword('pwd');
          test.setNextResponse(resSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(dummySaveEventHnadler, test);
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
          test.form.setNewPassword('pwd');
          test.form.setConfirmPassword('pwd');
          test.setNextResponse(resError);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          var button = test.form.submitButton();
          var buttonClass = button.attr('class');
          expect(buttonClass).not.toContain('link-button-disabled');
        });
    });

    itp('validates that the fields are not empty before submitting', function () {
      return setup().then(function (test) {
        Util.resetAjaxRequests();
        test.form.submit();
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.hasErrors()).toBe(true);
        Expect.isEmptyFieldError(test.form.newPassFieldError());
        Expect.isEmptyFieldError(test.form.confirmPassFieldError());
      });
    });

    itp('validates that the passwords match before submitting', function () {
      return setup().then(function (test) {
        Util.resetAjaxRequests();
        test.form.setNewPassword('a');
        test.form.setConfirmPassword('z');
        test.form.submit();
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.hasErrors()).toBe(true);
      });
    });

    itp('shows an error msg if there is an error submitting', function () {
      return setup()
        .then(function (test) {
          Q.stopUnhandledRejectionTracking();
          test.setNextResponse(resError);
          test.form.setNewPassword('a');
          test.form.setConfirmPassword('a');
          test.form.submit();
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
              controller: 'password-reset'
            },
            {
              name: 'AuthApiError',
              message: 'The password does not meet the complexity requirements of the current password policy.',
              statusCode: 403,
              xhr: {
                status: 403,
                responseType: 'json',
                responseText: '{"errorCode":"E0000080","errorSummary":"The password does not meet the complexity requirements of the current password policy.","errorLink":"E0000080","errorId":"oaeZL71b-kLQyae-eG7rzghzQ","errorCauses":[{"errorSummary":"Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name."}]}',
                responseJSON: {
                  errorCode: 'E0000080',
                  errorSummary: 'Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name.',
                  errorLink: 'E0000080',
                  errorId: 'oaeZL71b-kLQyae-eG7rzghzQ',
                  errorCauses: [{
                    errorSummary: 'Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name.'
                  }]
                }
              }
            }
          ]);
        });
    });

    itp('shows an error msg if there is an error submitting', function () {
      return setup({policyComplexity: 'all', 'features.showPasswordRequirementsAsHtmlList': true})
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resError);
            test.form.setNewPassword('a');
            test.form.setConfirmPassword('a');
            test.form.submit();
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
                controller: 'password-reset'
              },
              {
                name: 'AuthApiError',
                message: 'The password does not meet the complexity requirements of the current password policy.',
                statusCode: 403,
                xhr: {
                  status: 403,
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000080","errorSummary":"The password does not meet the complexity requirements of the current password policy.","errorLink":"E0000080","errorId":"oaeZL71b-kLQyae-eG7rzghzQ","errorCauses":[{"errorSummary":"Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name."}]}',
                  responseJSON: {
                    errorCode: 'E0000080',
                    errorSummary: 'Password requirements were not met. Password requirements: at least 8 characters, a lowercase letter, an uppercase letter, a number, a symbol, no parts of your username, does not include your first name, does not include your last name.',
                    errorLink: 'E0000080',
                    errorId: 'oaeZL71b-kLQyae-eG7rzghzQ',
                    errorCauses: [{
                      errorSummary: 'Password requirements were not met.'
                    }]
                  }
                }
              }
            ]);
          });
    });
  });

});
