/* eslint max-params: [2, 17], max-statements:[2, 70] */
import { _, $, Backbone } from '@okta/courage';
import getAuthClient from 'helpers/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import RegForm from 'helpers/dom/RegistrationForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resSuccess from 'helpers/xhr/SUCCESS';
import resErrorNotUnique from 'helpers/xhr/ERROR_notUnique';
import resErrorInvalidEmailDomain from 'helpers/xhr/ERROR_INVALID_EMAIL_DOMAIN';
import RegSchema from 'v1/models/RegistrationSchema';
import $sandbox from 'sandbox';
import Settings from 'models/Settings';


const itp = Expect.itp;
const testData = {
  policyId: '1234',
  profileSchema: {
    properties: {
      firstName: {
        type: 'string',
        description: 'First Name',
        default: 'Enter your first name',
        maxLength: 255,
      },
      lastName: {
        type: 'string',
        description: 'Last Name',
        default: 'Enter your last name',
        maxLength: 255,
      },
      userName: {
        type: 'string',
        description: 'Email Address',
        format: 'email',
        default: 'Enter your email',
        maxLength: 255,
      },
      email: {
        type: 'string',
        description: 'Email Address',
        format: 'email',
        default: 'Enter your email',
        maxLength: 255,
      },
      accountLevel: {
        type: 'string',
        description: 'Account Level',
        enum: ['Free', 'Premium', 'Platinum'],
        oneOf: [{ const: 'f', title: 'Free' }, { const: 'pr', title: 'Premium' }, { const: 'pl', title: 'Platinum' }],
      },
      address: {
        type: 'string',
        description: 'Street Address',
        default: 'Enter your street address',
        maxLength: 255,
      },
      referrer: {
        type: 'string',
        description: 'How did you hear about us?',
        maxLength: 1024,
      },
      countryCode: {
        type: 'country-code',
        format: 'country-code',
      },
      preferredLanguage: {
        type: 'language_code',
      },
      password: {
        type: 'string',
        description: 'Password',
        allOf: [
          {
            description: 'registration.passwordComplexity.minLength',
            minLength: 8,
          },
          {
            description: 'registration.passwordComplexity.minNumber',
            format: '[\\d]+',
          },
          {
            description: 'registration.passwordComplexity.minLower',
            format: '[a-z]+',
          },
          {
            description: 'registration.passwordComplexity.minUpper',
            format: '[A-Z]+',
          },
          {
            description: 'registration.passwordComplexity.excludeUsername',
            format: '^[#/userName]',
          },
        ],
      },
    },
    required: ['firstName', 'lastName', 'userName', 'password', 'referrer'],
    fieldOrder: [
      'userName',
      'password',
      'firstName',
      'lastName',
      'accountLevel',
      'referrer',
      'preferredLanguage',
      'countryCode',
    ],
  },
};

function setup(settings) {
  settings || (settings = {});
  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl }
  });
  const successSpy = jasmine.createSpy('success');
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
      },
      settings
    )
  );

  spyOn(router.settings, 'callGlobalError');
  const form = new RegForm($sandbox);
  const beacon = new Beacon($sandbox);

  Util.registerRouter(router);
  router.on('afterError', afterErrorHandler);
  spyOn(RegSchema.prototype, 'fetch').and.callFake(function() {
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
    afterErrorHandler: afterErrorHandler,
  });
}

Expect.describe('Registration', function() {
  Expect.describe('settings', function() {
    itp('uses default title', function() {
      return setup().then(function(test) {
        expect(test.form.titleText()).toEqual('Create Account');
      });
    });
    itp('uses custom title', function() {
      const config = {
        i18n: {
          en: {
            'registration.form.title': 'Custom Form Title',
          },
        },
      };

      return setup(config).then(function(test) {
        expect(test.form.titleText()).toEqual('Custom Form Title');
      });
    });
    itp('uses default for submit', function() {
      return setup().then(function(test) {
        expect(test.form.submitButtonText()).toEqual('Register');
      });
    });
    itp('uses custom text for submit', function() {
      const config = {
        i18n: {
          en: {
            'registration.form.submit': 'Custom Register Button',
          },
        },
      };

      return setup(config).then(function(test) {
        expect(test.form.submitButtonText()).toEqual('Custom Register Button');
      });
    });
    itp('policyid is retrieved from default org policy', function() {
      return setup().then(function(test) {
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.setLastname('LastName');
        test.form.setReferrer('referrer');
        test.setNextResponse(resSuccess);
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        expect(test.router.controller.model.settings.get('defaultPolicyId')).toContain('1234');
      });
    });
    itp('policyid from form settings is used instead of default org policy', function() {
      return setup().then(function(test) {
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.setLastname('LastName');
        test.form.setReferrer('referrer');
        test.router.controller.options.settings.set('policyId', '5678');
        test.setNextResponse(resSuccess);
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        expect(test.router.controller.model.settings.get('policyId')).toContain('5678');
      });
    });
    itp('sends relay state with registration post if set', function() {
      return setup({
        relayState: '%2Fapp%2FUserHome',
      }).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        const model = test.router.controller.model;
        const postData = model.toJSON();

        expect(postData.relayState).toBe('%2Fapp%2FUserHome');
      });
    });
    itp('sends relay state as undefined string with registration post if not set', function() {
      return setup().then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        const model = test.router.controller.model;
        const postData = model.toJSON();

        expect(postData.relayState).toBeUndefined();
      });
    });
    itp('duplicate email address in org error message is localized by widget', function() {
      return setup({
        i18n: {
          en: {
            'registration.error.userName.notUniqueWithinOrg': 'Custom duplicate {0} error message',
          }
        }
      }).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.setLastname('lastName');
        test.form.setReferrer('referrer');
        test.setNextResponse(resErrorNotUnique);
        test.form.submit();
        Util.callAllTimeouts();
        return Expect.waitForFormErrorBox(test.form, test);
      }).then(function(test) {
        expect(test.form.errorBox().length).toBe(1);
        expect(test.form.errorBox().text().trim()).toBe('Custom duplicate Email error message');
      });
    });
  });
  itp('render error summary when errorCause is using location that starts with data.userProfile', function() {
    return setup().then(function(test) {
      Util.resetAjaxRequests();
      test.form.setUserName('test@example.com');
      test.form.setPassword('Abcd1234');
      test.form.setFirstname('firstName');
      test.form.setLastname('lastName');
      test.form.setReferrer('referrer');
      test.setNextResponse(resErrorInvalidEmailDomain);
      test.form.submit();
      Util.callAllTimeouts();
      return Expect.waitForFormErrorBox(test.form, test);
    }).then(function(test) {
      expect(test.form.errorBox().length).toBe(1);
      expect(test.form.errorBox().text().trim()).toBe('You specified an invalid email domain');
    });
  });
  itp('render generic error when errorCause is using location that does not start with data.userProfile', function() {
    return setup().then(function(test) {
      Util.resetAjaxRequests();
      test.form.setUserName('test@example.com');
      test.form.setPassword('Abcd1234');
      test.form.setFirstname('firstName');
      test.form.setLastname('lastName');
      test.form.setReferrer('referrer');
      // update the location property to NOT start with data.userProfile
      resErrorInvalidEmailDomain.response.errorCauses[0].location = 'someLocation';
      test.setNextResponse(resErrorInvalidEmailDomain);
      test.form.submit();

      return Expect.waitForFormErrorBox(test.form, test);
    }).then(function(test) {
      expect(test.form.errorBox().text().trim()).toBe(
        'We found some errors. Please review the form and make corrections.'
      );
      const { errorSummary, location } = resErrorInvalidEmailDomain.response.errorCauses[0];
      test.router.controller.renderLegacyLocationErrorIfNeeded(location, errorSummary);
      expect(test.form.errorBox().length).toBe(1);
      expect(test.form.errorBox().text().trim()).toBe(
        'We found some errors. Please review the form and make corrections.'
      );
    });
  });

  Expect.describe('elements', function() {
    itp('has a firstname field', function() {
      return setup().then(function(test) {
        const firstname = test.form.firstnameField();

        expect(firstname.length).toBe(1);
        expect(firstname.attr('type')).toEqual('text');
      });
    });
    itp('has a lastname field', function() {
      return setup().then(function(test) {
        const lastname = test.form.lastnameField();

        expect(lastname.length).toBe(1);
        expect(lastname.attr('type')).toEqual('text');
      });
    });
    itp('has a username field', function() {
      return setup().then(function(test) {
        const userName = test.form.userNameField();

        expect(userName.length).toBe(1);
        expect(userName.attr('type')).toEqual('text');
      });
    });
    itp('has a preferredLanguage field', function() {
      return setup().then(function(test) {
        const preferredLanguage = test.form.input('preferredLanguage');

        expect(preferredLanguage.length).toBe(1);
        expect(preferredLanguage.attr('type')).toEqual('text');
      });
    });
    itp('has a countryCode field', function() {
      return setup().then(function(test) {
        const countryCode = test.form.input('countryCode');

        expect(countryCode.length).toBe(1);
        expect(countryCode.attr('type')).toEqual('text');
      });
    });
    itp('has a password field', function() {
      return setup().then(function(test) {
        const password = test.form.passwordField();

        expect(password.length).toBe(1);
        expect(password.attr('type')).toEqual('password');
      });
    });
    itp('shows label for required field', function() {
      return setup().then(function(test) {
        const requiredLabel = test.form.requiredFieldLabel();

        expect(requiredLabel).toBe('* indicates required field');
      });
    });
    itp('shows * next to placeholder for required field', function() {
      return setup().then(function(test) {
        const firstNamePlaceholder = test.form.fieldPlaceholder('firstName');

        expect(firstNamePlaceholder).toContain('*');
        const lastNamePlaceholder = test.form.fieldPlaceholder('lastName');

        expect(lastNamePlaceholder).toContain('*');
        const usernamePlaceholder = test.form.fieldPlaceholder('userName');

        expect(usernamePlaceholder).toContain('*');
        const passwordPlaceholder = test.form.fieldPlaceholder('password');

        expect(passwordPlaceholder).toContain('*');
        const referrerPlaceholder = test.form.fieldPlaceholder('referrer');

        expect(referrerPlaceholder).toContain('*');
        const addressPlaceholder = test.form.fieldPlaceholder('address');

        expect(addressPlaceholder).not.toContain('*');
      });
    });
  });

  Expect.describe('events', function() {
    itp('shows an error if email is empty and register', function() {
      return setup().then(function(test) {
        test.form.submit();
        expect(test.form.userNameErrorField().length).toBe(1);
      });
    });
    itp('shows an error if firstname is too long', function() {
      return setup().then(function(test) {
        test.form.setFirstname(Util.LoremIpsum);
        test.form.submit();
        expect(test.form.firstnameErrorField().length).toBe(1);
      });
    });
  });

  Expect.describe('password complexity', function() {
    itp('Does not show password complexity error on load', function() {
      return setup().then(function(test) {
        expect(test.form.hasPasswordComplexityUnsatisfied('0')).toBe(false);
        expect(test.form.hasPasswordComplexityUnsatisfied('1')).toBe(false);
        expect(test.form.hasPasswordComplexityUnsatisfied('2')).toBe(false);
        expect(test.form.hasPasswordComplexityUnsatisfied('3')).toBe(false);
        expect(test.form.hasPasswordComplexityUnsatisfied('4')).toBe(false);
      });
    });
    itp('shows password complexity satisfied if it is satisfied', function() {
      return setup().then(function(test) {
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
    itp('shows password complexity error if focus out and not satisfied', function() {
      return setup().then(function(test) {
        test.form.setUserName('test@example.com');
        test.form.setPassword('12345678');
        test.form.focusOutPassword();
        expect(test.form.hasPasswordComplexitySatisfied('0')).toBe(true);
        expect(test.form.hasPasswordComplexitySatisfied('1')).toBe(true);
        expect(test.form.hasPasswordComplexityUnsatisfied('2')).toBe(true);
        expect(test.form.hasPasswordComplexityUnsatisfied('3')).toBe(true);
        expect(test.form.hasPasswordComplexitySatisfied('4')).toBe(true);
        expect(test.form.$('#subschemas-password').html()).toBe(
          '<div class="subschema-0 subschema-satisfied"><p class=""><span class="icon icon-16 confirm-16"></span>registration.passwordComplexity.minLength</p></div>' +
          '<div class="subschema-1 subschema-satisfied"><p class=""><span class="icon icon-16 confirm-16"></span>registration.passwordComplexity.minNumber</p></div>' +
          '<div class="subschema-2 subschema-error subschema-unsatisfied"><p class="" role="alert" aria-live="polite"><span class="icon icon-16 error error-16-small"></span>registration.passwordComplexity.minLower</p></div>' +
          '<div class="subschema-3 subschema-error subschema-unsatisfied"><p class="" role="alert" aria-live="polite"><span class="icon icon-16 error error-16-small"></span>registration.passwordComplexity.minUpper</p></div>' +
          '<div class="subschema-4 subschema-satisfied"><p class=""><span class="icon icon-16 confirm-16"></span>registration.passwordComplexity.excludeUsername</p></div>'
        );
      });
    });
    itp('shows no password complexity error if focus out and satisfied all conditions', function() {
      return setup().then(function(test) {
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
    itp('shows no password complexity section if no password entered', function() {
      return setup().then(function(test) {
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
    itp('shows password complexity section if password entered', function() {
      return setup().then(function(test) {
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
    itp('shows error if password contains part of the username:testing', function() {
      return setup().then(function(test) {
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
    itp('shows error if password contains part of username:testing1234@okta.com', function() {
      return setup().then(function(test) {
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
    itp('shows error if password contains part of the username:testing_123', function() {
      return setup().then(function(test) {
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
    itp('shows error if password contains part of username:first-last.name@okta.com', function() {
      return setup().then(function(test) {
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
    itp('shows error if password contains part of email:testing1234@okta.com', function() {
      return setup().then(function(test) {
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
    itp('shows error if password contains part of email:first-last.name@okta.com', function() {
      return setup().then(function(test) {
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
    itp('hides password complexity error if password does not contain part of the username', function() {
      return setup().then(function(test) {
        test.form.setUserName('user@example.com');
        test.form.setPassword('Abcd1234');
        test.form.focusOutPassword();
        expect(test.form.passwordContainsUsernameError()).toBe(false);
      });
    });

    itp('shows password complexity error if username is entered after password', function() {
      return setup().then(function(test) {
        test.form.setPassword('Abcd1234');
        test.form.focusOutPassword();
        test.form.setUserName('abcd@example.com');
        expect(test.form.passwordContainsUsernameError()).toBe(true);
      });
    });
  });

  const expectRegCallbackError = function(test, callback, message) {
    const errMsg = callback + ':' + message;

    expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
    expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
      {
        controller: 'registration',
      },
      {
        name: 'REGISTRATION_FAILED',
        message: errMsg,
      },
    ]);
  };

  const expectRegApiError = function(test, message) {
    expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
    expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
      {
        controller: 'registration',
      },
      {
        name: 'REGISTRATION_FAILED',
        message: message,
      },
    ]);
  };

  Expect.describe('Registration callback hooks', function() {
    const DEFAULT_CALLBACK_ERROR = 'We could not process your registration at this time. Please try again later.';

    itp('calls parseSchema if registration.parseSchema defined in config', function() {
      const setting = {
        registration: {
          parseSchema: jasmine.createSpy('parseSchemaSpy'),
        },
      };

      return setup(setting).then(function() {
        expect(setting.registration.parseSchema).toHaveBeenCalled();
      });
    });
    itp('calls parseSchema if registration.parseSchema is defined and parseSchema calls onSuccess', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const setting = {
        registration: {
          parseSchema: function(resp, onSuccess, onFailure) {
            parseSchemaSpy(resp, onSuccess, onFailure);
            onSuccess(resp);
          },
          preSubmit: jasmine.createSpy('preSubmitSpy'),
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.submit();
        const model = test.router.controller.model;

        model.save();
        expect(setting.registration.preSubmit).toHaveBeenCalled();
      });
    });
    itp('parseSchema updates the schema correctly and calls onSuccess', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const setting = {
        registration: {
          parseSchema: function(schema, onSuccess, onFailure) {
            parseSchemaSpy(schema, onSuccess, onFailure);
            schema.profileSchema.properties.zip = {
              type: 'string',
              title: 'Zip',
              description: 'Zip code',
              default: 'Enter your zip code',
              maxLength: 255,
            };
            onSuccess(schema);
          },
          preSubmit: jasmine.createSpy('preSubmitSpy'),
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        expect(test.form.getFieldByName('zip').length).toBe(1);
        expect(test.form.fieldPlaceholder('zip')).toBe('Zip');
      });
    });
    itp(' does not call preSubmit if parseSchema calls onFailure with default error', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const setting = {
        registration: {
          parseSchema: function(resp, onSuccess, onFailure) {
            parseSchemaSpy(resp, onSuccess, onFailure);
            onFailure();
          },
          preSubmit: jasmine.createSpy('preSubmitSpy'),
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.submit();
        const model = test.router.controller.model;

        model.save();
        expectRegCallbackError(test, 'parseSchema', DEFAULT_CALLBACK_ERROR);
      });
    });
    itp(' does not call preSubmit if parseSchema calls onFailure with custom form level error', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const setting = {
        registration: {
          parseSchema: function(resp, onSuccess, onFailure) {
            parseSchemaSpy(resp, onSuccess, onFailure);
            const errorObject = {
              errorSummary: 'Custom form level parseSchema error message',
            };

            onFailure(errorObject);
          },
          preSubmit: jasmine.createSpy('preSubmitSpy'),
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.setReferrer('referrer');
        test.form.submit();
        const model = test.router.controller.model;

        model.save();
        expectRegCallbackError(test, 'parseSchema', 'Custom form level parseSchema error message');
      });
    });
    itp('preSubmit modifies postData correctly before submit', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const preSubmitSpy = jasmine.createSpy('preSubmitSpy');
      const setting = {
        registration: {
          parseSchema: function(schema, onSuccess, onFailure) {
            parseSchemaSpy(schema, onSuccess, onFailure);
            schema.profileSchema.properties.zip = {
              type: 'string',
              title: 'Zip',
              description: 'Zip code',
              default: 'Enter your zip code',
              maxLength: 255,
            };
            schema.profileSchema.properties.preferredLanguage = {
              type: 'language_code',
              title: 'Preferred language',
            };
            schema.profileSchema.properties.countryCode = {
              type: 'country_code',
              title: 'Country code',
            };
            onSuccess(schema);
          },
          preSubmit: function(postData, onSuccess, onFailure) {
            preSubmitSpy(postData, onSuccess, onFailure);
            postData.userName += '@example.com';
            onSuccess(postData);
          },
          postSubmit: jasmine.createSpy('postSubmitSpy'),
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
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
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        Util.callAllTimeouts();
        expect(test.router.controller.model.get('userName')).toBe('test@example.com');
        expect(test.router.controller.model.get('preferredLanguage')).toBe('en');
        expect(test.router.controller.model.get('countryCode')).toBe('us');
        expect(setting.registration.postSubmit).toHaveBeenCalled();
      });
    });
    itp('calls postSubmit when parseSchema and preSubmit call onSuccess', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const preSubmitSpy = jasmine.createSpy('preSubmitSpy');
      const setting = {
        registration: {
          parseSchema: function(resp, onSuccess, onFailure) {
            parseSchemaSpy(resp, onSuccess, onFailure);
            onSuccess(resp);
          },
          preSubmit: function(postData, onSuccess, onFailure) {
            preSubmitSpy(postData, onSuccess, onFailure);
            onSuccess(postData);
          },
          postSubmit: jasmine.createSpy('postSubmitSpy'),
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        Util.callAllTimeouts();
        expect(setting.registration.postSubmit).toHaveBeenCalled();
      });
    });
    itp('calls postSubmit call onSuccess assert username is same as email', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const preSubmitSpy = jasmine.createSpy('preSubmitSpy');
      const postSubmitSpy = jasmine.createSpy('postSubmitSpy');
      const setting = {
        registration: {
          parseSchema: function(resp, onSuccess, onFailure) {
            parseSchemaSpy(resp, onSuccess, onFailure);
            onSuccess(resp);
          },
          preSubmit: function(postData, onSuccess, onFailure) {
            preSubmitSpy(postData, onSuccess, onFailure);
            onSuccess(postData);
          },
          postSubmit: function(postData, onSuccess, onFailure) {
            postSubmitSpy(postData, onSuccess, onFailure);
            onSuccess(postData);
          },
        },
      };

      return setup(setting)
        .then(function(test) {
          spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
          Util.resetAjaxRequests();
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd1234');
          test.form.setFirstname('firstName');
          test.form.setLastname('lastName');
          test.form.setReferrer('referrer');
          test.form.submit();
          return Expect.waitForRegistrationComplete(test);
        })
        .then(function(test) {
          expect(test.router.navigate).toHaveBeenCalledWith('signin/register-complete', { trigger: true });
          expect(postSubmitSpy).toHaveBeenCalled();
          expect($('div.registration-complete .title').text()).toBe('Verification email sent');
          expect($('div.registration-complete .desc').text()).toBe('To finish signing in, check your email.');
        });
    });
    itp('does not call postSubmit if registration.postSubmit is defined and preSubmit calls onFailure', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const preSubmitSpy = jasmine.createSpy('preSubmitSpy');
      const setting = {
        registration: {
          parseSchema: function(resp, onSuccess, onFailure) {
            parseSchemaSpy(resp, onSuccess, onFailure);
            onSuccess(resp);
          },
          preSubmit: function(postData, onSuccess, onFailure) {
            preSubmitSpy(postData, onSuccess, onFailure);
            onFailure();
          },
          postSubmit: jasmine.createSpy('postSubmitSpy'),
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        expectRegCallbackError(test, 'preSubmit', DEFAULT_CALLBACK_ERROR);
      });
    });
    itp('shows form field errors if an error object passed to onFailure contains errorCauses', function() {
      // Spy on emitting of CustomEvent with type 'okta-i18n-error' in `StringUtil.localize()`
      const dispatchEventSpy = spyOn(document, 'dispatchEvent');
      const preSubmitSpy = jasmine.createSpy('preSubmitSpy');
      const postSubmitSpy = jasmine.createSpy('postSubmitSpy');
      const setting = {
        registration: {
          preSubmit: function(postData, onSuccess, onFailure) {
            preSubmitSpy(postData, onSuccess, onFailure);
            if (postData.firstName.length < 5) {
              const error = {
                errorSummary: 'Custom Validation Error',
                errorCauses: [
                  {
                    errorSummary: 'First name should have at least 5 characters',
                    property: 'firstName',
                  }
                ]
              };
              onFailure(error);
            } else {
              onSuccess(postData);
            }
          },
          postSubmit: postSubmitSpy,
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('AA');
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        Util.callAllTimeouts();
        expect(preSubmitSpy).toHaveBeenCalled();
        expect(postSubmitSpy).not.toHaveBeenCalled();
        expectRegApiError(test, 'preSubmit:Custom Validation Error');
        expect(test.form.errorBox().text().trim()).toContain(
          'We found some errors. Please review the form and make corrections.'
        );
        expect(test.form.firstnameErrorField().length).toBe(1);
        expect(test.form.firstnameErrorField().text().trim()).toBe(
          'First name should have at least 5 characters'
        );
        expect(dispatchEventSpy).not.toHaveBeenCalled();
      });
    });
    itp('triggers the afterError event when registration API throws an error', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const preSubmitSpy = jasmine.createSpy('preSubmitSpy');
      const postSubmitSpy = jasmine.createSpy('postSubmitSpy');
      const setting = {
        registration: {
          parseSchema: function(resp, onSuccess, onFailure) {
            parseSchemaSpy(resp, onSuccess, onFailure);
            onSuccess(resp);
          },
          preSubmit: function(postData, onSuccess, onFailure) {
            preSubmitSpy(postData, onSuccess, onFailure);
            onSuccess(postData);
          },
          postSubmit: function(response, onSuccess, onFailure) {
            postSubmitSpy(response, onSuccess, onFailure);
            onSuccess(response);
          },
        },
      };

      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.submit();
        const model = test.router.controller.model;
        const apiResponse = {
          responseJSON: {
            errorCauses: [
              {
                errorSummary: '\'Email address \' must be in the form of an email address',
              },
            ],
          },
        };

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().reject(apiResponse));
        model.save();
        Util.callAllTimeouts();
        expectRegApiError(test, '\'Email address \' must be in the form of an email address');
      });
    });
    itp('tests primary button staying disabled through save state', function() {
      const parseSchemaSpy = jasmine.createSpy('parseSchemaSpy');
      const preSubmitSpy = jasmine.createSpy('preSubmitSpy');
      const postSubmitSpy = jasmine.createSpy('postSubmitSpy');
      const setting = {
        registration: {
          parseSchema: function(resp, onSuccess, onFailure) {
            parseSchemaSpy(resp, onSuccess, onFailure);
            onSuccess(resp);
          },
          preSubmit: function(postData, onSuccess, onFailure) {
            preSubmitSpy(postData, onSuccess, onFailure);
            onSuccess(postData);
          },
          postSubmit: function(postData, onSuccess, onFailure) {
            postSubmitSpy(postData, onSuccess, onFailure);
            onSuccess(postData);
          },
        },
      };

      return setup(setting)
        .then(function(test) {
          spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
          spyOn(Settings.prototype, 'postRegistrationSubmit').and
            .returnValue(new Promise(resolve => setTimeout(resolve, 105)));
          Util.resetAjaxRequests();
          test.form.setUserName('test@example.com');
          test.form.setPassword('Abcd1234');
          test.form.setFirstname('firstName');
          test.form.setLastname('lastName');
          test.form.setReferrer('referrer');
          expect($('input.button-primary').length).toBe(1);
          expect($('input.button-primary.btn-disabled').length).toBe(0);
          test.form.submit();
          return new Promise(resolve => setTimeout(resolve, 100));
        }).then(() => {
          expect($('input.button-primary.btn-disabled').length).toBe(1);
        });
    });
  });

  const sanitizeSetting = function() {
    const preSubmitSpy = jasmine.createSpy('preSubmitSpy');
    return {
      registration: {
        preSubmit: function(postData, onSuccess, onFailure) {
          preSubmitSpy(postData, onSuccess, onFailure);
          onSuccess(postData);
        },
        postSubmit: jasmine.createSpy('postSubmitSpy'),
      },
    };
  };

  Expect.describe('sanitizes invalid request values', function() {
    itp('null value', function() {
      const setting = sanitizeSetting();
      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.setLastname(null);
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        Util.callAllTimeouts();
        expect(test.router.controller.model.get('userName')).toBe('test@example.com');
        expect(test.router.controller.model.get('firstName')).toBe('firstName');
        expect(test.router.controller.model.has('lastName')).toBe(false);
        expect(setting.registration.postSubmit).toHaveBeenCalled();
      });
    });
    itp('undefined value', function() {
      const setting = sanitizeSetting();
      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.setLastname(undefined);
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        Util.callAllTimeouts();
        expect(test.router.controller.model.get('userName')).toBe('test@example.com');
        expect(test.router.controller.model.get('firstName')).toBe('firstName');
        expect(test.router.controller.model.has('lastName')).toBe(false);
        expect(setting.registration.postSubmit).toHaveBeenCalled();
      });
    });
    itp('empty string', function() {
      const setting = sanitizeSetting();
      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.setLastname('');
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        Util.callAllTimeouts();
        expect(test.router.controller.model.get('userName')).toBe('test@example.com');
        expect(test.router.controller.model.get('firstName')).toBe('firstName');
        expect(test.router.controller.model.has('lastName')).toBe(false);
        expect(setting.registration.postSubmit).toHaveBeenCalled();
      });
    });
    itp('no sanitize', function() {
      const setting = sanitizeSetting();
      return setup(setting).then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUserName('test@example.com');
        test.form.setPassword('Abcd1234');
        test.form.setFirstname('firstName');
        test.form.setLastname('lastName');
        test.form.submit();
        const model = test.router.controller.model;

        spyOn(Backbone.Model.prototype, 'save').and.returnValue($.Deferred().resolve());
        model.save();
        Util.callAllTimeouts();
        expect(test.router.controller.model.get('userName')).toBe('test@example.com');
        expect(test.router.controller.model.get('firstName')).toBe('firstName');
        expect(test.router.controller.model.get('lastName')).toBe('lastName');
        expect(setting.registration.postSubmit).toHaveBeenCalled();
      });
    });
  });
});
