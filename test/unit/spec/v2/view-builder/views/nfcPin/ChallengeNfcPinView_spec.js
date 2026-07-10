import ChallengeNfcPinView from 'v2/view-builder/views/nfcPin/ChallengeNfcPinView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import NfcPinVerifyResponse from '../../../../../../../playground/mocks/data/idp/idx/authenticator-verification-nfc-pin.json';
import NfcPinDeviceChallengeResponse from '../../../../../../../playground/mocks/data/idp/idx/authenticator-verification-nfc-pin-device-challenge.json';

describe('v2/view-builder/views/nfcPin/ChallengeNfcPinView', function() {
  let testContext;

  beforeEach(function() {
    testContext = {};
    testContext.init = (mockResponse = NfcPinVerifyResponse) => {
      const currentAuthenticatorEnrollment = mockResponse.currentAuthenticatorEnrollment.value;
      const appState = new AppState({
        currentAuthenticatorEnrollment,
        currentAuthenticator: undefined,
        authenticatorEnrollments: mockResponse.authenticatorEnrollments?.value || [],
        app: mockResponse.app?.value || {},
      }, {});

      jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockReturnValue([
        { label: 'NFC' },
        { label: 'Password' },
      ]);
      jest.spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').mockReturnValue(true);

      const settings = new Settings({ baseUrl: 'http://localhost:3000' });

      // Build uiSchema matching what the ion transformer produces for secret fields
      const uiSchema = [{
        'name': 'credentials.passcode',
        'label': 'NFC',
        'type': 'password',
        'label-top': true,
        'params': { showPasswordToggle: false },
      }];

      const currentViewState = {
        name: mockResponse.remediation.value[0].name,
        relatesTo: { value: currentAuthenticatorEnrollment },
        uiSchema,
      };

      testContext.view = new ChallengeNfcPinView({
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

  describe('PIN Entry Phase (no contextualData.challenge)', function() {
    beforeEach(function() {
      testContext.init(NfcPinVerifyResponse);
    });

    it('renders PIN entry form', function() {
      expect(testContext.view.$('.nfc-pin-challenge').length).toBe(1);
    });

    it('shows "Verify with your PIN" title', function() {
      expect(testContext.view.$('.okta-form-title').text()).toContain('Verify with your PIN');
    });

    it('renders passcode input field', function() {
      expect(testContext.view.$('input[name="credentials.passcode"]').length).toBe(1);
    });

    it('shows "Verify" submit button', function() {
      expect(testContext.view.$('.o-form-button-bar input[type="submit"]').length).toBe(1);
    });

    it('shows "Forgot PIN?" link when recover action exists', function() {
      expect(testContext.view.$('.link[data-se="forgot-pin"]').length).toBe(1);
    });

    it('shows "Verify with something else" footer link', function() {
      expect(testContext.view.$('.link[data-se="switchAuthenticator"]').length).toBe(1);
    });
  });

  describe('Device Challenge Phase (contextualData.challenge present)', function() {
    beforeEach(function() {
      testContext.init(NfcPinDeviceChallengeResponse);
    });

    it('does NOT render PIN entry form', function() {
      expect(testContext.view.$('.nfc-pin-challenge').length).toBe(0);
    });
  });
});
