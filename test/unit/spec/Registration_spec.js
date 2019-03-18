/* eslint max-params: [2, 17], max-statements:[2, 70] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/util/Expect',
  'helpers/dom/Beacon',
  'helpers/dom/RegistrationForm',
  'models/RegistrationSchema',
  'LoginRouter',
  'sandbox',
  'util/Errors',
  'helpers/xhr/SUCCESS',
],
function (Okta, OktaAuth, Util, Expect, Beacon, RegForm, RegSchema,
  Router, $sandbox, Errors, resSuccess) {

  var { _, $, Backbone } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;
  var testData = {
    policyId: '1234',
    profileSchema: {
      'properties': {
        'firstName': {
          'type': 'string',
          'description': 'First Name',
          'default': 'Enter your first name',
          'maxLength': 255
        },
        'lastName': {
          'type': 'string',
          'description': 'Last Name',
          'default': 'Enter your last name',
          'maxLength': 255
        },
        'userName': {
          'type': 'string',
          'description': 'Email Address',
          'format' : 'email',
          'default': 'Enter your email',
          'maxLength': 255
        },
        'email': {
          'type': 'string',
          'description': 'Email Address',
          'format' : 'email',
          'default': 'Enter your email',
          'maxLength': 255
        },
        'accountLevel': {
          'type': 'string',
          'description': 'Account Level',
          'enum': [ 'Free', 'Premium', 'Platinum' ],
          'oneOf': [
            {'const': 'f', 'title': 'Free'},
            {'const': 'pr', 'title': 'Premium'},
            {'const': 'pl', 'title': 'Platinum'}
          ]
        },
        'address': {
          'type': 'string',
          'description': 'Street Address',
          'default': 'Enter your street address',
          'maxLength': 255
        },
        'referrer': {
          'type': 'string',
          'description': 'How did you hear about us?',
          'maxLength': 1024
        },
        'countryCode': {
          'type': 'country-code',
          'format': 'country-code'
        },
        'preferredLanguage': {
          'type': 'language_code',
        },
        'password' : {
          'type' : 'string',
          'description' : 'Password',
          'allOf' : [
            {
              'description': 'registration.passwordComplexity.minLength',
              'minLength': 8
            },
            {
              'description': 'registration.passwordComplexity.minNumber',
              'format': '[\\d]+'
            },
            {
              'description': 'registration.passwordComplexity.minLower',
              'format': '[a-z]+'
            },
            {
              'description': 'registration.passwordComplexity.minUpper',
              'format': '[A-Z]+'
            },
            {
              'description': 'registration.passwordComplexity.excludeUsername',
              'format': '^[#/userName]'
            }
          ]
        }
      },
      'required': ['firstName', 'lastName', 'userName', 'password', 'referrer'],
      'fieldOrder': ['userName', 'password', 'firstName', 'lastName', 'accountLevel', 'referrer', 'preferredLanguage', 'countryCode']
    }
  };

  function setup (settings) {
    settings || (settings = {});
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var successSpy = jasmine.createSpy('success');
    var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy
    }, settings));
    spyOn(router.settings, 'callGlobalError');
    var form = new RegForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.registerRouter(router);
    router.on('afterError', afterErrorHandler);
    spyOn(RegSchema.prototype, 'fetch').and.callFake(function () {
      this.set(this.parse(testData));
      return $.Deferred().resolve();
    });
    Util.mockRouterNavigate(router);
    router.register();
    return Expect.waitForRegistration({
      router: router,
      form: form,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      afterErrorHandler: afterErrorHandler
    });
  }

  Expect.describe('Registration', function () {

    Expect.describe('settings', function () {
      itp('uses default title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toEqual('Create Account');
        });
      });
      itp('uses custom title', function () {
        var config = {
          'i18n': {
            'en': {
              'registration.form.title': 'Custom Form Title'
            }
          }
        };
        return setup(config).then(function (test) {
          expect(test.form.titleText()).toEqual('Custom Form Title');
        });
      });
      itp('uses default for submit', function () {
        return setup().then(function (test) {
          expect(test.form.submitButtonText()).toEqual('Register');
        });
      });
      itp('uses custom text for submit', function () {
        var config = {
          'i18n': {
            'en': {
              'registration.form.submit': 'Custom Register Button'
            }
          }
        };
        return setup(config).then(function (test) {
          expect(test.form.submitButtonText()).toEqual('Custom Register Button');
        });
      });
      itp('policyid is retrieved from default org policy', function () {
        return setup().then(function (test) {
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd1234');
          test.form.setFirstname('firstName');
          test.form.setLastname('LastName');
          test.form.setReferrer('referrer');
          test.setNextResponse(resSuccess);
          test.form.submit();
          var model = test.router.controller.model;
          spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
          model.save();
          expect(test.router.controller.model.settings.get('defaultPolicyId')).toContain('1234');
        });
      });
      itp('policyid from form settings is used instead of default org policy', function () {
        return setup().then(function (test) {
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd1234');
          test.form.setFirstname('firstName');
          test.form.setLastname('LastName');
          test.form.setReferrer('referrer');
          test.router.controller.options.settings.set('policyId', '5678');
          test.setNextResponse(resSuccess);
          test.form.submit();
          var model = test.router.controller.model;
          spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
          model.save();
          expect(test.router.controller.model.settings.get('policyId')).toContain('5678');
        });
      });
      itp('sends relay state with registration post if set', function () {
        return setup({
          relayState: '%2Fapp%2FUserHome'
        }).then(function (test) {
          $.ajax.calls.reset();
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd1234');
          var model = test.router.controller.model;
          var postData = model.toJSON();
          expect(postData.relayState).toBe('%2Fapp%2FUserHome');
        });
      });
      itp('sends relay state as undefined string with registration post if not set', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd1234');
          var model = test.router.controller.model;
          var postData = model.toJSON();
          expect(postData.relayState).toBeUndefined();
        });
      });
    });

    Expect.describe('elements', function () {
      itp('has a firstname field', function () {
        return setup().then(function (test) {
          var firstname = test.form.firstnameField();
          expect(firstname.length).toBe(1);
          expect(firstname.attr('type')).toEqual('text');
        });
      });
      itp('has a lastname field', function () {
        return setup().then(function (test) {
          var lastname = test.form.lastnameField();
          expect(lastname.length).toBe(1);
          expect(lastname.attr('type')).toEqual('text');
        });
      });
      itp('has a username field', function () {
        return setup().then(function (test) {
          var userName = test.form.userNameField();
          expect(userName.length).toBe(1);
          expect(userName.attr('type')).toEqual('text');
        });
      });
      itp('has a preferredLanguage field', function () {
        return setup().then(function (test) {
          var preferredLanguage = test.form.input('preferredLanguage');
          expect(preferredLanguage.length).toBe(1);
          expect(preferredLanguage.attr('type')).toEqual('text');
        });
      });
      itp('has a countryCode field', function () {
        return setup().then(function (test) {
          var countryCode = test.form.input('countryCode');
          expect(countryCode.length).toBe(1);
          expect(countryCode.attr('type')).toEqual('text');
        });
      });
      itp('has a password field', function () {
        return setup().then(function (test) {
          var password = test.form.passwordField();
          expect(password.length).toBe(1);
          expect(password.attr('type')).toEqual('password');
        });
      });
      itp('shows label for required field', function () {
        return setup().then(function (test) {
          var requiredLabel = test.form.requiredFieldLabel();
          expect(requiredLabel).toBe('* indicates required field');
        });
      });
      itp('shows * next to placeholder for required field', function () {
        return setup().then(function (test) {
          var firstNamePlaceholder = test.form.fieldPlaceholder('firstName');
          expect(firstNamePlaceholder).toContain('*');
          var lastNamePlaceholder = test.form.fieldPlaceholder('lastName');
          expect(lastNamePlaceholder).toContain('*');
          var usernamePlaceholder = test.form.fieldPlaceholder('userName');
          expect(usernamePlaceholder).toContain('*');
          var passwordPlaceholder = test.form.fieldPlaceholder('password');
          expect(passwordPlaceholder).toContain('*');
          var referrerPlaceholder = test.form.fieldPlaceholder('referrer');
          expect(referrerPlaceholder).toContain('*');
          var addressPlaceholder = test.form.fieldPlaceholder('address');
          expect(addressPlaceholder).not.toContain('*');
        });
      });
    });

    Expect.describe('events', function () {
      itp('shows an error if email is empty and register', function () {
        return setup().then(function (test) {
          test.form.submit();
          expect(test.form.userNameErrorField().length).toBe(1);
        });
      });
      itp('shows an error if firstname is too long', function () {
        return setup().then(function (test) {
          test.form.setFirstname(Util.LoremIpsum);
          test.form.submit();
          expect(test.form.firstnameErrorField().length).toBe(1);
        });
      });
    });

    Expect.describe('password complexity', function () {
      itp('Does not show password complexity error on load', function () {
        return setup().then(function (test) {
          expect(test.form.hasPasswordComplexityUnsatisfied('0')).toBe(false);
          expect(test.form.hasPasswordComplexityUnsatisfied('1')).toBe(false);
          expect(test.form.hasPasswordComplexityUnsatisfied('2')).toBe(false);
          expect(test.form.hasPasswordComplexityUnsatisfied('3')).toBe(false);
          expect(test.form.hasPasswordComplexityUnsatisfied('4')).toBe(false);
        });
      });
      itp('shows password complexity satisfied if it is satisfied', function () {
        return setup().then(function (test) {
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd');
          test.form.focusOutPassword();
          expect(test.form.hasPasswordComplexityUnsatisfied('0')).toBe(true);
          expect(test.form.hasPasswordComplexityUnsatisfied('1')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('2')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('3')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('4')).toBe(true);
        });
      });
      itp('shows password complexity error if focus out and not satisfied', function () {
        return setup().then(function (test) {
          test.form.setUserName('test@example.com');
          test.form.setPassword('12345678');
          test.form.focusOutPassword();
          expect(test.form.hasPasswordComplexitySatisfied('0')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('1')).toBe(true);
          expect(test.form.hasPasswordComplexityUnsatisfied('2')).toBe(true);
          expect(test.form.hasPasswordComplexityUnsatisfied('3')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('4')).toBe(true);
        });
      });
      itp('shows no password complexity error if focus out and satisfied all conditions', function () {
        return setup().then(function (test) {
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd1234');
          test.form.focusOutPassword();
          expect(test.form.hasPasswordComplexitySatisfied('0')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('1')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('2')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('3')).toBe(true);
          expect(test.form.hasPasswordComplexitySatisfied('4')).toBe(true);
        });
      });
      itp('shows no password complexity section if no password entered', function () {
        return setup().then(function (test) {
          test.form.setUserName('test@example.com');
          test.form.setPassword('');
          test.form.focusOutPassword();
          expect(test.form.isPasswordComplexitySectionHidden('0')).toBe(true);
          expect(test.form.isPasswordComplexitySectionHidden('1')).toBe(true);
          expect(test.form.isPasswordComplexitySectionHidden('2')).toBe(true);
          expect(test.form.isPasswordComplexitySectionHidden('3')).toBe(true);
          expect(test.form.isPasswordComplexitySectionHidden('4')).toBe(true);
        });
      });
      itp('shows password complexity section if password entered', function () {
        return setup().then(function (test) {
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd1234');
          test.form.focusOutPassword();
          expect(test.form.isPasswordComplexitySectionHidden('0')).toBe(false);
          expect(test.form.isPasswordComplexitySectionHidden('1')).toBe(false);
          expect(test.form.isPasswordComplexitySectionHidden('2')).toBe(false);
          expect(test.form.isPasswordComplexitySectionHidden('3')).toBe(false);
          expect(test.form.isPasswordComplexitySectionHidden('4')).toBe(false);
        });
      });
      itp('shows error if password contains part of the username:testing', function () {
        return setup().then(function (test) {
          test.form.setUserName('testing');
          test.form.setPassword('Testing1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('1234Testing1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('abcdTesting1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('aatesting34');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('12aatesting');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('12testingaBtesting');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('est1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('tetete1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
        });
      });
      itp('shows error if password contains part of username:testing1234@okta.com', function () {
        return setup().then(function (test) {
          test.form.setUserName('testing1234@okta.com');
          test.form.setPassword('Testing1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('testing1234@okta.com');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('abcdTesting1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('aatesting34');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('12aatesting');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('12testingaBtesting');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('Okta1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
        });
      });
      itp('shows error if password contains part of the username:testing_123', function () {
        return setup().then(function (test) {
          test.form.setUserName('testing_123');
          test.form.setPassword('testing');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('testing123');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('123Est123');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('test_123');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('te_12');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('_abc_123');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
        });
      });
      itp('shows error if password contains part of username:first-last.name@okta.com', function () {
        return setup().then(function (test) {
          test.form.setUserName('first-last.name@okta.com');
          test.form.setPassword('Abcd1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('Testingfirst');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('last_1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('testName1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
        });
      });
      itp('shows error if password contains part of email:testing1234@okta.com', function () {
        return setup().then(function (test) {
          test.form.setEmail('testing1234@okta.com');
          test.form.setPassword('Testing1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('testing1234@okta.com');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('abcdTesting1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('aatesting34');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('12aatesting');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('12testingaBtesting');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('Okta1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
        });
      });
      itp('shows error if password contains part of email:first-last.name@okta.com', function () {
        return setup().then(function (test) {
          test.form.setEmail('first-last.name@okta.com');
          test.form.setPassword('Abcd1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
          test.form.setPassword('Testingfirst');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('last_1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
          test.form.setPassword('testName1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(true);
        });
      });
      itp('hides password complexity error if password does not contain part of the username', function () {
        return setup().then(function (test) {
          test.form.setUserName('user@example.com');
          test.form.setPassword('Abcd1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
        });
      });

      itp('shows password complexity error if username is entered after password', function () {
        return setup().then(function (test) {
          test.form.setPassword('Abcd1234');
          test.form.focusOutPassword();
          test.form.setUserName('abcd@example.com');
          expect(test.form.passwordContainsUsernameError()).toBe(true);
        });
      });
    });

    var expectRegCallbackError = function (test, callback, message) {
      var errMsg = callback+':'+ message;
      expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
      expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
        {
          controller: 'registration'
        },
        {
          name: 'REGISTRATION_FAILED',
          message: errMsg
        }
      ]);
    };

    var expectRegApiError = function (test, message) {
      expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
      expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
        {
          controller: 'registration'
        },
        {
          name: 'REGISTRATION_FAILED',
          message: message
        }
      ]);
    };
    Expect.describe('Registration callback hooks', function () {
      var DEFAULT_CALLBACK_ERROR = 'We could not process your registration at this time. Please try again later.';
      itp('calls parseSchema if registration.parseSchema defined in config', function () {
        var setting = {
          'registration': {
            'parseSchema': jasmine.createSpy('parseSchemaSpy')
          }
        };
        return setup(setting).then(function () {
          expect(setting.registration.parseSchema).toHaveBeenCalled();
        });
      });
      itp('calls parseSchema if registration.parseSchema is defined and parseSchema calls onSuccess', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var setting = {
          'registration': {
            'parseSchema': function (resp, onSuccess, onFailure){
              parseSchemaSpy(resp, onSuccess, onFailure);
              onSuccess(resp);
            },
            'preSubmit': jasmine.createSpy('preSubmitSpy')
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setUserName('test@example.com');
            test.form.setPassword('Abcd1234');
            test.form.setFirstname('firstName');
            test.form.submit();
            var model = test.router.controller.model;
            model.save();
            expect(setting.registration.preSubmit).toHaveBeenCalled();
          });
      });
      itp('parseSchema updates the schema correctly and calls onSuccess', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var setting = {
          'registration': {
            'parseSchema': function (schema, onSuccess, onFailure){
              parseSchemaSpy(schema, onSuccess, onFailure);
              schema.profileSchema.properties.zip = {
                'type': 'string',
                'title': 'Zip',
                'description': 'Zip code',
                'default': 'Enter your zip code',
                'maxLength': 255
              };
              onSuccess(schema);
            },
            'preSubmit': jasmine.createSpy('preSubmitSpy')
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            expect(test.form.getFieldByName('zip').length).toBe(1);
            expect(test.form.fieldPlaceholder('zip')).toBe('Zip');
          });
      });
      itp(' does not call preSubmit if parseSchema calls onFailure with default error', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var setting = {
          'registration': {
            'parseSchema': function (resp, onSuccess, onFailure){
              parseSchemaSpy(resp, onSuccess, onFailure);
              onFailure();
            },
            'preSubmit': jasmine.createSpy('preSubmitSpy')
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setUserName('test@example.com');
            test.form.setPassword('Abcd1234');
            test.form.setFirstname('firstName');
            test.form.submit();
            var model = test.router.controller.model;
            model.save();
            expectRegCallbackError(test, 'parseSchema', DEFAULT_CALLBACK_ERROR);
          });
      });
      itp(' does not call preSubmit if parseSchema calls onFailure with custom form level error', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var setting = {
          'registration': {
            'parseSchema': function (resp, onSuccess, onFailure){
              parseSchemaSpy(resp, onSuccess, onFailure);
              var errorObject = {
                'errorSummary': 'Custom form level parseSchema error message'
              };
              onFailure(errorObject);
            },
            'preSubmit': jasmine.createSpy('preSubmitSpy')
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setUserName('test@example.com');
            test.form.setPassword('Abcd1234');
            test.form.setFirstname('firstName');
            test.form.setReferrer('referrer');
            test.form.submit();
            var model = test.router.controller.model;
            model.save();
            expectRegCallbackError(test, 'parseSchema', 'Custom form level parseSchema error message');
          });
      });
      itp('preSubmit modifies postData correctly before submit', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var preSubmitSpy = jasmine.createSpy('preSubmitSpy');
        var setting = {
          'registration': {
            'parseSchema': function (schema, onSuccess, onFailure){
              parseSchemaSpy(schema, onSuccess, onFailure);
              schema.profileSchema.properties.zip = {
                'type': 'string',
                'title': 'Zip',
                'description': 'Zip code',
                'default': 'Enter your zip code',
                'maxLength': 255
              };
              schema.profileSchema.properties.preferredLanguage = {
                'type': 'language_code',
                'title': 'Preferred language',
              };
              schema.profileSchema.properties.countryCode = {
                'type': 'country_code',
                'title': 'Country code',
              };
              onSuccess(schema);
            },
            'preSubmit': function (postData, onSuccess, onFailure) {
              preSubmitSpy(postData, onSuccess, onFailure);
              postData.userName += '@example.com';
              onSuccess(postData);
            },
            'postSubmit': jasmine.createSpy('postSubmitSpy')
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            expect(test.form.getFieldByName('zip').length).toBe(1);
            expect(test.form.fieldPlaceholder('zip')).toBe('Zip');
            expect(test.form.getFieldByName('countryCode').length).toBe(1);
            expect(test.form.fieldPlaceholder('countryCode')).toBe('Country code');
            expect(test.form.getFieldByName('preferredLanguage').length).toBe(1);
            expect(test.form.fieldPlaceholder('preferredLanguage')).toBe('Preferred language');
            test.form.setUserName('test');
            test.form.setPassword('Abcd1234');
            test.form.setFirstname('firstName');
            test.form.input('preferredLanguage').val('en');
            test.form.input('preferredLanguage').trigger('change');
            test.form.input('countryCode').val('us');
            test.form.input('countryCode').trigger('change');
            test.form.submit();
            expect(test.router.controller.model.get('userName')).toBe('test');
            var model = test.router.controller.model;
            spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
            model.save();
            expect(test.router.controller.model.get('userName')).toBe('test@example.com');
            expect(test.router.controller.model.get('preferredLanguage')).toBe('en');
            expect(test.router.controller.model.get('countryCode')).toBe('us');
            expect(setting.registration.postSubmit).toHaveBeenCalled();
          });
      });
      itp('calls postSubmit when parseSchema and preSubmit call onSuccess', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var preSubmitSpy = jasmine.createSpy('preSubmitSpy');
        var setting = {
          'registration': {
            'parseSchema': function (resp, onSuccess, onFailure) {
              parseSchemaSpy(resp, onSuccess, onFailure);
              onSuccess(resp);
            },
            'preSubmit': function (postData, onSuccess, onFailure) {
              preSubmitSpy(postData, onSuccess, onFailure);
              onSuccess(postData);
            },
            'postSubmit': jasmine.createSpy('postSubmitSpy')
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setUserName('test@example.com');
            test.form.setPassword('Abcd1234');
            test.form.setFirstname('firstName');
            test.form.submit();
            var model = test.router.controller.model;
            spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
            model.save();
            expect(setting.registration.postSubmit).toHaveBeenCalled();
          });
      });
      itp('calls postSubmit call onSuccess assert username is same as email', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var preSubmitSpy = jasmine.createSpy('preSubmitSpy');
        var setting = {
          'registration': {
            'parseSchema': function (resp, onSuccess, onFailure) {
              parseSchemaSpy(resp, onSuccess, onFailure);
              onSuccess(resp);
            },
            'preSubmit': function (postData, onSuccess, onFailure) {
              preSubmitSpy(postData, onSuccess, onFailure);
              onSuccess(postData);
            },
            'postSubmit': jasmine.createSpy('postSubmitSpy')
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setUserName('test@example.com');
            test.form.setPassword('Abcd1234');
            test.form.setFirstname('firstName');
            test.form.submit();
            var model = test.router.controller.model;
            spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
            model.save();
            test.router.navigate('signin/register-complete', {trigger: true});
            expect(setting.registration.postSubmit).toHaveBeenCalled();
            expect(test.router.navigate).toHaveBeenCalledWith('signin/register-complete', {trigger: true});
            return tick().then(function () {
              expect( $('div.registration-complete').text().includes('Verification email sent')).toBe(true);
            });
          });
      });
      itp('does not call postSubmit if registration.postSubmit is defined and preSubmit calls onFailure', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var preSubmitSpy = jasmine.createSpy('preSubmitSpy');
        var setting = {
          'registration': {
            'parseSchema': function (resp, onSuccess, onFailure) {
              parseSchemaSpy(resp, onSuccess, onFailure);
              onSuccess(resp);
            },
            'preSubmit': function (postData, onSuccess, onFailure) {
              preSubmitSpy(postData, onSuccess, onFailure);
              onFailure();
            },
            'postSubmit': jasmine.createSpy('postSubmitSpy')
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setUserName('test@example.com');
            test.form.setPassword('Abcd1234');
            test.form.setFirstname('firstName');
            test.form.submit();
            var model = test.router.controller.model;
            spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
            model.save();
            expectRegCallbackError(test, 'preSubmit', DEFAULT_CALLBACK_ERROR);
          });
      });
      itp('triggers the afterError event when registration API throws an error', function () {
        var parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
        var preSubmitSpy = jasmine.createSpy('preSubmitSpy');
        var postSubmitSpy = jasmine.createSpy('postSubmitSpy');
        var setting = {
          'registration': {
            'parseSchema': function (resp, onSuccess, onFailure) {
              parseSchemaSpy(resp, onSuccess, onFailure);
              onSuccess(resp);
            },
            'preSubmit': function (postData, onSuccess, onFailure) {
              preSubmitSpy(postData, onSuccess, onFailure);
              onSuccess();
            },
            'postSubmit': function (response, onSuccess, onFailure) {
              postSubmitSpy(response, onSuccess, onFailure);
              onSuccess(response);
            }
          }
        };
        return setup(setting)
          .then(function (test) {
            $.ajax.calls.reset();
            test.form.setUserName('test');
            test.form.setPassword('Abcd1234');
            test.form.setFirstname('firstName');
            test.form.submit();
            var model = test.router.controller.model;
            var apiResponse = {
              'responseJSON' : {
                'errorCauses': [
                  {
                    'errorSummary': '\'Email address \' must be in the form of an email address'
                  }
                ]
              }
            };
            spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().reject(apiResponse));
            model.save();
            expectRegApiError(test, '\'Email address \' must be in the form of an email address');
          });
      });
    });

  });
});
