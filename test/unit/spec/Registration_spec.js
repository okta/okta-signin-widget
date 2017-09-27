/* eslint max-params: [2, 17], max-statements:[2, 70] */
define([
  'vendor/lib/q',
  'okta/underscore',
  'okta/jquery',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/util/Expect',
  'helpers/dom/Beacon',
  'helpers/dom/RegistrationForm',
  'models/RegistrationSchema',
  'LoginRouter',
  'sandbox'
],
function (Q, _, $, OktaAuth, Util, Expect, Beacon, RegistrationForm, RegistrationSchema, Router, $sandbox) {

  var itp = Expect.itp;
  
  var testData = {
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
        'referrer': {
          'type': 'string',
          'description': 'How did you hear about us?',
          'maxLength': 1024
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
      'required': ['firstName', 'lastName', 'userName', 'password', 'accountLevel'],
      'fieldOrder': ['userName', 'password', 'firstName', 'lastName', 'accountLevel', 'referrer']
    }
  };

  function setup(settings) {
    settings || (settings = {});
    settings.registration = {
      'clientId': '1234'
    };
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var successSpy = jasmine.createSpy('success');
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy
    }, settings));
    var form = new RegistrationForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.registerRouter(router);
    spyOn(RegistrationSchema.prototype, 'fetch').and.callFake(function () {
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
      setNextResponse: setNextResponse
    });
  }

  Expect.describe('Registration', function () {

    Expect.describe('settings', function () {
      itp('uses default title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toEqual('Create Account');
        });
      });
      itp('uses default for submit', function () {
        return setup().then(function (test) {
          expect(test.form.submitButtonText()).toEqual('Register');
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
      itp('has a email field', function () {
        return setup().then(function (test) {
          var email = test.form.emailField();
          expect(email.length).toBe(1);
          expect(email.attr('type')).toEqual('text');
        });
      });
      itp('has a password field', function () {
        return setup().then(function (test) {
          var password = test.form.passwordField();
          expect(password.length).toBe(1);
          expect(password.attr('type')).toEqual('password');
        });
      });
    });

    Expect.describe('events', function () {
      itp('shows an error if email is empty and register', function () {
        return setup().then(function (test) {
          test.form.submit();
          expect(test.form.emailErrorField().length).toBe(1);
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
          test.form.setEmail('test@example.com');
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
          test.form.setEmail('test@example.com');
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
          test.form.setEmail('test@example.com');
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
          test.form.setEmail('test@example.com');
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
          test.form.setEmail('test@example.com');
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
          test.form.setEmail('testing');
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
      itp('shows error if password contains part of the username:testing_123', function () {
        return setup().then(function (test) {
          test.form.setEmail('testing_123');
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
          test.form.setEmail('user@example.com');
          test.form.setPassword('Abcd1234');
          test.form.focusOutPassword();
          expect(test.form.passwordContainsUsernameError()).toBe(false);
        });
      });

    });
  });
});
