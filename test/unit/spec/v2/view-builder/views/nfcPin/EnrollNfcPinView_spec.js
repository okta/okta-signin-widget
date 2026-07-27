import EnrollNfcPinView from 'v2/view-builder/views/nfcPin/EnrollNfcPinView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import NfcPinEnrollPinCreationResponse from '../../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-nfc-pin-pin-creation.json';
import NfcPinEnrollDeviceChallengeResponse from '../../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-nfc-pin-device-challenge.json';

describe('v2/view-builder/views/nfcPin/EnrollNfcPinView', function() {
  let testContext;

  beforeEach(function() {
    testContext = {};
    testContext.init = (mockResponse = NfcPinEnrollPinCreationResponse) => {
      const currentAuthenticator = mockResponse.currentAuthenticator?.value;
      const enrollmentAuthenticator = mockResponse.enrollmentAuthenticator?.value;
      const appState = new AppState({
        currentAuthenticator,
        enrollmentAuthenticator,
        authenticatorEnrollments: mockResponse.authenticatorEnrollments?.value || [],
        app: mockResponse.app?.value || {},
      }, {});

      jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockReturnValue([
        { label: 'NFC' },
        { label: 'Passkeys' },
      ]);
      jest.spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').mockReturnValue(true);

      const settings = new Settings({ baseUrl: 'http://localhost:3000' });

      // Determine uiSchema based on whether mock has passcode field
      const credentials = mockResponse.remediation.value[0].value?.find(v => v.name === 'credentials');
      const hasPasscode = credentials?.form?.value?.some(f => f.name === 'passcode');

      const uiSchema = hasPasscode ? [{
        'name': 'credentials.passcode',
        'label': 'NFC',
        'type': 'password',
        'label-top': true,
        'params': { showPasswordToggle: true },
      }] : [];

      const currentViewState = {
        name: mockResponse.remediation.value[0].name,
        relatesTo: { value: currentAuthenticator },
        uiSchema,
      };

      testContext.view = new EnrollNfcPinView({
        el: $sandbox,
        appState,
        settings,
        currentViewState,
      });
      testContext.view.render();
    };
  });

  afterEach(function() {
    $sandbox.empty();
    jest.resetAllMocks();
  });

  describe('PIN Creation Phase (has passcode field)', function() {
    beforeEach(function() {
      testContext.init(NfcPinEnrollPinCreationResponse);
    });

    it('renders PIN creation form', function() {
      expect(testContext.view.$('.nfc-pin-create').length).toBe(1);
    });

    it('shows "Choose a PIN" title', function() {
      expect(testContext.view.$('.okta-form-title').text()).toContain('Choose a PIN');
    });

    it('renders PIN input field', function() {
      expect(testContext.view.$('input[name="credentials.passcode"]').length).toBe(1);
    });

    it('renders confirm PIN field', function() {
      expect(testContext.view.$('input[name="confirmPassword"]').length).toBe(1);
    });

    it('shows PIN requirements', function() {
      expect(testContext.view.$('[data-se="password-authenticator--rules"]').length).toBe(1);
    });

    it('shows "Return to authenticator list" link in footer', function() {
      expect(testContext.view.$('.link[data-se="switchAuthenticator"]').length).toBe(1);
    });

    it('renders PIN fields as password type (masked)', function() {
      expect(testContext.view.$('input[name="credentials.passcode"]').attr('type')).toBe('password');
    });
  });

  describe('PIN Validation', function() {
    beforeEach(function() {
      testContext.init(NfcPinEnrollPinCreationResponse);
    });

    it('rejects non-numeric PIN', function() {
      const model = testContext.view.form.model;
      model.set('credentials.passcode', 'abcd');
      model.set('confirmPassword', 'abcd');
      const errors = model.validate();
      expect(errors).toBeTruthy();
      expect(errors['credentials.passcode']).toBeTruthy();
    });

    it('rejects PIN with wrong length', function() {
      const model = testContext.view.form.model;
      model.set('credentials.passcode', '12');
      model.set('confirmPassword', '12');
      const errors = model.validate();
      expect(errors).toBeTruthy();
      expect(errors['credentials.passcode']).toBeTruthy();
    });

    it('rejects mismatched PINs', function() {
      const model = testContext.view.form.model;
      model.set('credentials.passcode', '1234');
      model.set('confirmPassword', '5678');
      const errors = model.validate();
      expect(errors).toBeTruthy();
      expect(errors.confirmPassword).toBeTruthy();
    });

    it('accepts valid matching numeric PIN', function() {
      const model = testContext.view.form.model;
      model.set('credentials.passcode', '1234');
      model.set('confirmPassword', '1234');
      const errors = model.validate();
      expect(errors).toBeFalsy();
    });
  });

  describe('Device Challenge Phase (no passcode field)', function() {
    beforeEach(function() {
      testContext.init(NfcPinEnrollDeviceChallengeResponse);
    });

    it('does NOT render PIN creation form', function() {
      expect(testContext.view.$('.nfc-pin-create').length).toBe(0);
    });
  });
});
