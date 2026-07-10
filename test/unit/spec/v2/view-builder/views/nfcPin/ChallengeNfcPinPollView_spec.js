import ChallengeNfcPinPollView from 'v2/view-builder/views/nfcPin/ChallengeNfcPinPollView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import NfcPinDeviceChallengeResponse from '../../../../../../../playground/mocks/data/idp/idx/authenticator-verification-nfc-pin-device-challenge.json';

describe('v2/view-builder/views/nfcPin/ChallengeNfcPinPollView', function() {
  let testContext;

  beforeEach(function() {
    testContext = {};
    testContext.init = () => {
      const currentAuthenticatorEnrollment = NfcPinDeviceChallengeResponse.currentAuthenticatorEnrollment.value;
      const appState = new AppState({
        currentAuthenticatorEnrollment,
        authenticatorEnrollments: NfcPinDeviceChallengeResponse.authenticatorEnrollments?.value || [],
        app: NfcPinDeviceChallengeResponse.app?.value || {},
      }, {});

      jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockReturnValue([
        { label: 'NFC' },
        { label: 'Password' },
      ]);
      jest.spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').mockReturnValue(true);

      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      const currentViewState = {
        name: 'challenge-poll',
        relatesTo: { value: currentAuthenticatorEnrollment },
        refresh: 4000,
      };

      testContext.view = new ChallengeNfcPinPollView({
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

  it('renders NFC intermediate screen with "Verify with NFC" title', function() {
    testContext.init();
    expect(testContext.view.$('.okta-form-title').text()).toContain('Verify with NFC');
  });

  it('shows NFC-specific description', function() {
    testContext.init();
    expect(testContext.view.$('.skinny-content').text()).toContain('Open Okta Verify and scan your NFC device');
  });

  it('shows "Open Okta Verify" button as fallback', function() {
    testContext.init();
    expect(testContext.view.$('#launch-ov').length).toBe(1);
    expect(testContext.view.$('#launch-ov').text()).toContain('Open Okta Verify');
  });

  it('renders primary button style for "Open Okta Verify"', function() {
    testContext.init();
    expect(testContext.view.$('#launch-ov').hasClass('button-primary')).toBe(true);
  });

  it('shows "Verify with something else" link in footer', function() {
    testContext.init();
    expect(testContext.view.$('[data-se="switchAuthenticator"]').length).toBe(1);
  });

  it('does NOT show the generic "Click Open Okta Verify" screen', function() {
    testContext.init();
    // Should not contain download link or generic prompt text
    expect(testContext.view.$('#download-ov').length).toBe(0);
  });
});
