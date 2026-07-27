import EnrollNfcPinPollView from 'v2/view-builder/views/nfcPin/EnrollNfcPinPollView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import NfcPinEnrollDeviceChallengeResponse from '../../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-nfc-pin-device-challenge.json';

describe('v2/view-builder/views/nfcPin/EnrollNfcPinPollView', function() {
  let testContext;

  beforeEach(function() {
    testContext = {};
    testContext.init = () => {
      const currentAuthenticator = NfcPinEnrollDeviceChallengeResponse.currentAuthenticator?.value;
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments: NfcPinEnrollDeviceChallengeResponse.authenticatorEnrollments?.value || [],
        app: NfcPinEnrollDeviceChallengeResponse.app?.value || {},
      }, {});

      jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockReturnValue([
        { label: 'NFC' },
        { label: 'Passkeys' },
      ]);
      jest.spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').mockReturnValue(true);

      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      const currentViewState = {
        name: 'enroll-poll',
        relatesTo: { value: currentAuthenticator },
        refresh: 4000,
      };

      testContext.view = new EnrollNfcPinPollView({
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

  it('renders NFC intermediate screen with "Set up NFC" title', function() {
    testContext.init();
    expect(testContext.view.$('.okta-form-title').text()).toContain('Set up NFC');
  });

  it('shows NFC enrollment description', function() {
    testContext.init();
    expect(testContext.view.$('.skinny-content').text()).toContain('Open Okta Verify and add your NFC device');
  });

  it('shows "Open Okta Verify" button as fallback', function() {
    testContext.init();
    expect(testContext.view.$('#launch-ov').length).toBe(1);
  });

  it('renders primary button style for "Open Okta Verify"', function() {
    testContext.init();
    expect(testContext.view.$('#launch-ov').hasClass('button-primary')).toBe(true);
  });

  it('shows "Return to authenticator list" link in footer', function() {
    testContext.init();
    expect(testContext.view.$('[data-se="switchAuthenticator"]').length).toBe(1);
  });

  it('does NOT show the generic "Click Open Okta Verify" screen', function() {
    testContext.init();
    expect(testContext.view.$('#download-ov').length).toBe(0);
  });
});
