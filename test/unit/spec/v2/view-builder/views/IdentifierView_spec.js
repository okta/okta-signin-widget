import { Model, $ } from '@okta/courage';
import IdentifierView from 'v2/view-builder/views/IdentifierView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import XHRIdentifyWithPassword from '../../../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import XHRIdentifyWithThirdPartyIdps from '../../../../../../playground/mocks/data/idp/idx/identify-with-third-party-idps.json';
import XHRIdentifyWithPasskeys from '../../../../../../playground/mocks/data/idp/idx/identify-with-passkeys-launch-authenticator.json';
import XHRIdentifyWithWebAuthnAutofill from '../../../../../../playground/mocks/data/idp/idx/identify-with-webauthn-autofill.json';
import Bundles from 'util/Bundles';
import CookieUtil from 'util/CookieUtil';
import webauthn from 'util/webauthn';
import { FORMS } from 'v2/ion/RemediationConstants';


const originalPublicKeyCredential = global.PublicKeyCredential;

describe('v2/view-builder/views/IdentifierView', function() {
  let originalLoginEnBundle;
  let testContext;
  let currentViewState = {};
  let settings = new Settings({
    baseUrl: 'http://localhost:3000',
  });

  beforeAll(() => {
    global.PublicKeyCredential = {
      isConditionalMediationAvailable: jest.fn(),
    };
    originalLoginEnBundle = Bundles.login_en;
  });
  afterAll(() => {
    global.PublicKeyCredential = originalPublicKeyCredential;
    Bundles['login_en'] = originalLoginEnBundle;
    originalLoginEnBundle = null;
  });

  beforeEach(function() {
    testContext = {};
    testContext.init = (remediations = XHRIdentifyWithThirdPartyIdps.remediation.value) => {
      const appState = new AppState({}, {});
      appState.set('remediations', remediations);
      testContext.view = new IdentifierView({
        appState,
        settings,
        model: new Model(),
        currentViewState
      });
      testContext.view.render();
    };
  });
  afterEach(function() {
    jest.resetAllMocks();
  });

  it('view renders forgot password link correctly with mutiple IDPs', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init();

    // The forgot password link should NOT be in the siw-main-footer and should be in .links-primary
    expect(testContext.view.$el.find('.links-primary .js-forgot-password').length).toEqual(1);
    expect(testContext.view.$el.find('.siw-main-footer .js-forgot-password').length).toEqual(0);
  });

  [XHRIdentifyWithPassword, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('view renders forgot password link correctly with no IDPs', function() {
      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
      jest.spyOn(webauthn, 'isConditionalMediationAvailable').mockReturnValue(false);
      testContext.init(mock.remediation.value);

      // The forgot password link should be in the siw-main-footer
      expect(testContext.view.$el.find('.siw-main-footer .js-forgot-password').length).toEqual(1);
      expect(testContext.view.$el.find('.links-primary .js-forgot-password').length).toEqual(0);
    });
  });

  it('view renders IDP buttons correctly with idpDisplay property', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init();

    // The idp buttons should be rendered below the main login fields when no idpDisplay defined.
    expect(testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp').length).toEqual(1);
    expect(testContext.view.$el.find('.o-form-fieldset-container .sign-in-with-idp').length).toEqual(0);

    settings.set('idpDisplay', 'PRIMARY');
    testContext.init();

    // The idp buttons should be rendered above the main login fields when idpDisplay is PRIMARY.
    expect(testContext.view.$el.find('.o-form-fieldset-container .sign-in-with-idp').length).toEqual(1);
    expect(testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp').length).toEqual(0);

    settings.set('idpDisplay', 'SECONDARY');
    testContext.init();

    // The idp buttons should be rendered below the main login fields when idpDisplay is SECONDARY.
    expect(testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp').length).toEqual(1);
    expect(testContext.view.$el.find('.o-form-fieldset-container .sign-in-with-idp').length).toEqual(0);
  });

  [XHRIdentifyWithPassword, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('view renders no IDP buttons with no IDPs in the remediation', function() {
      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
      testContext.init(mock.remediation.value);

      // No IDP buttons should be rendered.
      expect(testContext.view.$el.find('.o-form-fieldset-container .sign-in-with-idp').length).toEqual(0);
      expect(testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp').length).toEqual(0);
    });
  });

  it('view renders IDP buttons correctly with tooltip if text is too long', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);

    // Case where text is short
    jest.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(() => 50);
    testContext.init();

    // Get the idp buttons
    let buttons = testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp .social-auth-button.link-button');

    buttons.each(function(){
      // Ensure there is no tooltip when text is short.
      expect($(this).attr('title')).toEqual(undefined);
    });


    // Case where text is too long.
    jest.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(() => 500);
    testContext.init();

    // Get the idp buttons
    buttons = testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp .social-auth-button.link-button');

    buttons.each(function(){
      // Ensure the button tooltip is equal to the button title when it is long
      expect($(this).attr('title')).toEqual($(this).text());
    });
  });

  [XHRIdentifyWithPassword, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('view renders custom button with customButtons config', function() {
      settings.set('customButtons', [{
        title: 'Click Me',
        className: 'btn-customAuth'
      }]);

      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
      testContext.init(mock.remediation.value);

      const $customButton = testContext.view.$el.find('.o-form-button-bar .custom-buttons .btn-customAuth');
      expect($customButton.text()).toEqual('Click Me');
    });
  });

  [XHRIdentifyWithPassword, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('view renders custom button title based on i18n config', function() {
      const i18n = {
        en: {
          'customButton.title': 'Custom Button Title',
        }
      };
      settings.set('i18n', i18n);
      settings.set('customButtons', [{
        i18nKey: 'customButton.title',
        className: 'btn-customAuth'
      }]);
      Bundles['login_en'] = i18n.en;

      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
      testContext.init(mock.remediation.value);

      const $customButton = testContext.view.$el.find('.o-form-button-bar .custom-buttons .btn-customAuth');
      expect($customButton.text()).toEqual('Custom Button Title');
    });
  });

  [XHRIdentifyWithPassword, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('view updates model and view correctly if "username" config is passed in', function() {
      settings.set('username', 'testUsername');

      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);

      currentViewState = {
        uiSchema: [{
          'autoComplete': 'username',
          'data-se': 'o-form-fieldset-identifier',
          'label': 'Username',
          'label-top': true,
          'name': 'identifier',
          'type': 'text',
        }]
      };

      // Ensure model and view are updated correctly
      testContext.init(mock.remediation.value);
      expect(testContext.view.model.get('identifier')).toEqual('testUsername');
      expect(testContext.view.$el.find('.o-form-input-name-identifier input').val()).toEqual('testUsername');
    });
  });

  [XHRIdentifyWithPassword, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('pre-fill identifier form with username from cookie when rememberMe feature is enabled', function() {
      settings.set('username', '');
      settings.set('features.rememberMe', true);

      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockImplementation(remediation => {
        return [FORMS.LAUNCH_WEBAUTHN_AUTHENTICATOR, FORMS.LAUNCH_AUTHENTICATOR].includes(remediation);
      });
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
      jest.spyOn(CookieUtil, 'getCookieUsername').mockReturnValue('testUsername');

      currentViewState = {
        uiSchema: [{
          'autoComplete': 'username',
          'data-se': 'o-form-fieldset-identifier',
          'label': 'Username',
          'label-top': true,
          'name': 'identifier',
          'type': 'text',
        }]
      };

      // Ensure model and view are updated correctly
      testContext.init(mock.remediation.value);
      expect(testContext.view.model.get('identifier')).toEqual('testUsername');
      expect(testContext.view.$el.find('.o-form-input-name-identifier input').val()).toEqual('testUsername');
      expect(testContext.view.$el.find('.o-form-input-name-identifier input').attr('autocomplete')).toEqual('username');
    });
  });

  [XHRIdentifyWithPassword, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('does not pre-fill identifier form with username from cookie when rememberMe feature is disabled', function() {
      settings.set('username', '');

      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockImplementation(remediation => {
        return [FORMS.LAUNCH_WEBAUTHN_AUTHENTICATOR, FORMS.LAUNCH_AUTHENTICATOR].includes(remediation);
      });
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);

      jest.spyOn(IdentifierView.prototype.Body.prototype, '_shouldApplyRememberMyUsername').mockReturnValue(false);
      jest.spyOn(CookieUtil, 'getCookieUsername').mockReturnValue('testUsername');

      currentViewState = {
        uiSchema: [{
          'autoComplete': 'username',
          'data-se': 'o-form-fieldset-identifier',
          'label': 'Username',
          'label-top': true,
          'name': 'identifier',
          'type': 'text',
        }]
      };

      // Ensure model and view are updated correctly
      testContext.init(mock.remediation.value);
      expect(testContext.view.model.get('identifier')).not.toEqual('testUsername');
      expect(testContext.view.$el.find('.o-form-input-name-identifier input').val()).toEqual('');
      expect(testContext.view.$el.find('.o-form-input-name-identifier input').attr('autocomplete')).toEqual('username');
    });
  });

  [XHRIdentifyWithPassword, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('should customize username/password required messages', function() {
      const i18n = {
        en: {
          'error.username.required': 'Username is required!',
          'error.password.required': 'Password is required!'
        }
      };
      settings = new Settings({
        baseUrl: 'http://localhost:3000',
        i18n
      });
      Bundles['login_en'] = i18n.en;

      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);

      currentViewState = {
        uiSchema: [{
          'autoComplete': 'username',
          'data-se': 'o-form-fieldset-identifier',
          'label': 'Username',
          'label-top': true,
          'name': 'identifier',
          'type': 'text',
        }, {
          'label': 'Password',
          'label-top': true,
          'data-se': 'o-form-fieldset-credentials.passcode',
          'name': 'credentials.passcode',
          'params':  {
            'showPasswordToggle': false,
          },
          'secret': true,
          'type': 'password',
        }]
      };

      testContext.init(mock.remediation.value);
      expect(testContext.view.form.isValid()).toEqual(false);

      const $usernameError = testContext.view.$el.find('[data-se="o-form-fieldset-identifier"] .o-form-input-error');
      const $psswordError = testContext.view.$el.find('[data-se="o-form-fieldset-credentials.passcode"] .o-form-input-error');
      expect($usernameError.text()).toEqual('Username is required!');
      expect($psswordError.text()).toEqual('Password is required!');
    });
  });

  [XHRIdentifyWithPasskeys, XHRIdentifyWithWebAuthnAutofill].forEach(mock => {
    it('should show "signin with passkeys" button when launch-passkeys-authenticator remediation exist', function() {
      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockImplementation(remediation => {
        return remediation === FORMS.LAUNCH_PASSKEYS_AUTHENTICATOR;
      });
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(true);
      testContext.init(mock.remediation.value);

      expect(testContext.view.$el.find('.sign-in-with-passkeys-option').length).toEqual(1);
    });
  });

  it('should have "username webauthn" as the autocomplete attribute on the identifier field on browsers that support passkey autofill', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockImplementation(remediation => {
      return remediation === FORMS.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR;
    });
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(true);
    jest.spyOn(webauthn, 'isConditionalMediationAvailable').mockReturnValue(true);
    testContext.init(XHRIdentifyWithWebAuthnAutofill.remediation.value);
    expect(testContext.view.$el.find('input[name="identifier"]').attr('autocomplete')).toEqual('username webauthn');
  });

  it('should have "username" as the autocomplete attribute on the identifier field on browsers that do not support passkey autofill', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockImplementation(remediation => {
      return remediation === FORMS.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR;
    });
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(true);
    jest.spyOn(webauthn, 'isConditionalMediationAvailable').mockReturnValue(false);
    testContext.init(XHRIdentifyWithWebAuthnAutofill.remediation.value);
    expect(testContext.view.$el.find('input[name="identifier"]').attr('autocomplete')).toEqual('username');
  });

  describe('WebAuthn Autofill error handling', function() {
    beforeEach(function() {
      jest.spyOn(AppState.prototype, 'get').mockImplementation((key) => {
        const mockData = {
          'idx': { neededToProceed: [] },
          'webauthnAutofillUIChallenge': { challengeData: { challenge: 'test-challenge' } },
          'neededToProceed': [],
          'remediations': [],
          'currentAuthenticator': { profile: {} },
          'currentAuthenticatorEnrollment': { profile: {} }
        };
        return mockData[key] || null;
      });

      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockImplementation(remediation => {
        return remediation === FORMS.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR;
      });
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(true);
      jest.spyOn(webauthn, 'isConditionalMediationAvailable').mockReturnValue(true);
      jest.spyOn(webauthn, 'isPasskeyAutofillAvailable').mockResolvedValue(true);

      global.AbortController = jest.fn().mockImplementation(() => ({
        signal: {},
        abort: jest.fn()
      }));
    });

    it.each([
      {
        description: 'should suppress error when navigator.credentials.get throws Relying Party ID mismatch error',
        errorMessage: 'Relying Party ID mismatch',
        errorName: 'SecurityError',
        errorCode: 18,
        isRelyingPartyIdMismatch: true,
        expectErrorSuppressed: true
      },
      {
        description: 'should suppress error when navigator.credentials.get throws AbortError (e.g., when modal passkey flow cancels autofill)',
        errorMessage: 'The operation was aborted.',
        errorName: 'AbortError',
        errorCode: 20,
        isRelyingPartyIdMismatch: false,
        expectErrorSuppressed: true
      },
      {
        description: 'should show error when navigator.credentials.get throws non-Relying Party ID mismatch error',
        errorMessage: 'Unsuppressed WebAuthn error',
        errorName: 'UnsuppressedError',
        errorCode: undefined,
        isRelyingPartyIdMismatch: false,
        expectErrorSuppressed: false
      }
    ])('$description', async function({ errorMessage, errorName, errorCode, expectErrorSuppressed }) {
      const error = new Error(errorMessage);
      error.name = errorName;
      error.code = errorCode;
      const credentialsGetMock = jest.fn().mockRejectedValue(error);

      Object.defineProperty(global, 'navigator', {
        value: { credentials: { get: credentialsGetMock } },
        writable: true
      });

      testContext.init(XHRIdentifyWithWebAuthnAutofill.remediation.value);

      await testContext.view.form.getCredentialsAndInvokeAction();

      if (expectErrorSuppressed) {
        // Check that NO error message is displayed in the UI (error was suppressed)
        expect(testContext.view.$el.find('.infobox-error p').length).toBe(0);
      } else {
        // Check that an error message IS displayed in the UI (error was not suppressed)
        expect(testContext.view.$el.find('.infobox-error p').text()).toContain(errorMessage);
      }
    });
  });

  describe('WebAuthn Autofill conditional invocation in postRender', function() {
    let getCredentialsAndInvokeActionSpy;

    beforeEach(function() {
      getCredentialsAndInvokeActionSpy = jest.spyOn(
        IdentifierView.prototype.Body.prototype,
        'getCredentialsAndInvokeAction'
      ).mockResolvedValue(undefined);
    });

    afterEach(function() {
      getCredentialsAndInvokeActionSpy.mockRestore();
    });

    it('should invoke getCredentialsAndInvokeAction when Autofill UI remediation is present', function() {
      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockImplementation(remediation => {
        return remediation === FORMS.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR;
      });
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(true);

      testContext.init(XHRIdentifyWithWebAuthnAutofill.remediation.value);

      expect(getCredentialsAndInvokeActionSpy).toHaveBeenCalledTimes(1);
    });

    it('should NOT invoke getCredentialsAndInvokeAction when Autofill UI remediation is NOT present', function() {
      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockImplementation(remediation => {
        // Only return true for non-autofill remediations
        return remediation === FORMS.LAUNCH_PASSKEYS_AUTHENTICATOR;
      });
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(true);

      testContext.init(XHRIdentifyWithPasskeys.remediation.value);

      expect(getCredentialsAndInvokeActionSpy).not.toHaveBeenCalled();
    });
  });

  describe('Focus behavior (autoFocus feature)', () => {
    beforeEach(() => {
      // Ensure we start from a clean currentViewState for each focus test
      currentViewState = {
        uiSchema: [{
          'autoComplete': 'username',
          'data-se': 'o-form-fieldset-identifier',
          'label': 'Username',
          'label-top': true,
          'name': 'identifier',
          'type': 'text',
        }, {
          'label': 'Password',
          'label-top': true,
          'data-se': 'o-form-fieldset-credentials.passcode',
          'name': 'credentials.passcode',
          'params':  {
            'showPasswordToggle': false,
          },
          'secret': true,
          'type': 'password',
        }]
      };
      jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
      jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    });

    it('auto-focuses password field when identifier is prefilled and autoFocus enabled', () => {
      const appState = new AppState({}, {});
      settings.set('features.autoFocus', true);
      appState.set('remediations', XHRIdentifyWithPassword.remediation.value);
      const view = new IdentifierView({ appState, settings, model: new Model(), currentViewState });
      view.render();

      // Simulate identifier being prefilled (e.g. from config or cookie) AFTER render so we can spy before focus
      view.form.model.set('identifier', 'prefilled-user');

      const inputs = view.form.getInputs();
      const passwordInputView = inputs.find(i => i.options.name === 'credentials.passcode');
      const passwordFocusSpy = jest.spyOn(passwordInputView, 'focus');

      view.form.focus();
      expect(passwordFocusSpy).toHaveBeenCalled();
    });

    it('does not auto-focus password field when identifier is empty even if autoFocus enabled', () => {
      const appState = new AppState({}, {});
      settings.set('features.autoFocus', true);
      appState.set('remediations', XHRIdentifyWithPassword.remediation.value);
      const view = new IdentifierView({ appState, settings, model: new Model(), currentViewState });
      view.render();

      const inputs = view.form.getInputs();
      const passwordInputView = inputs.find(i => i.options.name === 'credentials.passcode');
      const passwordFocusSpy = jest.spyOn(passwordInputView, 'focus');

      view.form.focus();
      expect(passwordFocusSpy).not.toHaveBeenCalled();
    });

    it('does not auto-focus password field when autoFocus disabled even identifier is filled', () => {
      const appState = new AppState({}, {});
      settings.set('features.autoFocus', false);
      appState.set('remediations', XHRIdentifyWithPassword.remediation.value);
      const view = new IdentifierView({ appState, settings, model: new Model(), currentViewState });
      view.render();

      // Simulate identifier being prefilled (e.g. from config or cookie) AFTER render so we can spy before focus
      view.form.model.set('identifier', 'prefilled-user');

      const inputs = view.form.getInputs();
      const passwordInputView = inputs.find(i => i.options.name === 'credentials.passcode');
      const passwordFocusSpy = jest.spyOn(passwordInputView, 'focus');

      view.form.focus();
      expect(passwordFocusSpy).not.toHaveBeenCalled();
    });
  });
});
