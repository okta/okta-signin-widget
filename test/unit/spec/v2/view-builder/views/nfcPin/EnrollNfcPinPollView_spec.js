import EnrollNfcPinPollView from 'v2/view-builder/views/nfcPin/EnrollNfcPinPollView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import Util from 'util/Util';
import NfcPinEnrollDeviceChallengeResponse from '../../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-nfc-pin-device-challenge.json';
import NfcPinEnrollDeviceChallengeAppLinkResponse from '../../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-nfc-pin-device-challenge-app-link.json';

describe('v2/view-builder/views/nfcPin/EnrollNfcPinPollView', function() {
  let testContext;

  beforeEach(function() {
    testContext = {};
    testContext.init = (response = NfcPinEnrollDeviceChallengeResponse) => {
      const currentAuthenticator = response.currentAuthenticator?.value;
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments: response.authenticatorEnrollments?.value || [],
        app: response.app?.value || {},
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

  it('auto-launches a custom URI setupNfcUrl in a hidden iframe', function() {
    testContext.init();
    expect(testContext.view.$('#custom-uri-container').attr('src'))
      .toBe(NfcPinEnrollDeviceChallengeResponse.currentAuthenticator.value.contextualData.setupNfcUrl);
  });

  it.each([
    ['APP_LINK', true],
    ['UNIVERSAL_LINK', false],
  ])('opens a %s setupNfcUrl with a top-level redirect instead of a hidden iframe', function(challengeMethod, isAppLink) {
    const response = JSON.parse(JSON.stringify(NfcPinEnrollDeviceChallengeAppLinkResponse));
    response.currentAuthenticator.value.contextualData.challenge.value.challengeMethod = challengeMethod;
    jest.spyOn(Util, 'redirect').mockImplementation(() => {});
    testContext.init(response);
    expect(testContext.view.$('#custom-uri-container').length).toBe(0);

    testContext.view.$('#launch-ov').click();

    expect(Util.redirect).toHaveBeenCalledWith(
      response.currentAuthenticator.value.contextualData.setupNfcUrl,
      window,
      isAppLink,
    );
    expect(testContext.view.$('#custom-uri-container').length).toBe(0);
  });
});
