import { Model } from '@okta/courage';
import SignInWithNfcView from 'v2/view-builder/views/nfcPin/SignInWithNfcView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import { FORMS } from 'v2/ion/RemediationConstants';
import $sandbox from 'sandbox';

describe('v2/view-builder/views/nfcPin/SignInWithNfcView', function() {
  const testContext = {};
  const settings = new Settings({
    baseUrl: 'http://localhost:3000'
  });

  beforeEach(function() {
    testContext.init = (launchRemediation = { name: 'launch-nfc-authenticator' }) => {
      const appState = new AppState({
        idx: {
          neededToProceed: [
            launchRemediation,
          ],
        },
        remediations: [
          { name: 'launch-nfc-authenticator' },
        ],
      }, {});
      jest.spyOn(appState, 'trigger');
      jest.spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').mockReturnValue(false);

      testContext.view = new SignInWithNfcView({
        el: $sandbox,
        appState,
        settings,
        currentViewState: {},
        model: new Model(),
      });
      testContext.view.render();
    };
  });

  afterEach(function() {
    $sandbox.empty();
    jest.resetAllMocks();
  });

  it('renders the Sign in with NFC button', function() {
    testContext.init();
    expect(testContext.view.$('.sign-in-with-nfc-option').length).toBe(1);
    expect(testContext.view.$('.button').length).toBe(1);
  });

  it('renders the default button label', function() {
    testContext.init();
    expect(testContext.view.$('.button').text()).toBe('Sign in with NFC');
  });

  it('renders the custom button label when customAuthenticatorName is provided', function() {
    testContext.init({ name: 'launch-nfc-authenticator', customAuthenticatorName: 'Badge' });
    expect(testContext.view.$('.button').text()).toBe('Sign in with Badge');
  });

  it('renders the default button label when customAuthenticatorName is blank', function() {
    testContext.init({ name: 'launch-nfc-authenticator', customAuthenticatorName: '  ' });
    expect(testContext.view.$('.button').text()).toBe('Sign in with NFC');
  });

  it('renders the NFC description', function() {
    testContext.init();
    expect(testContext.view.$('.signin-with-nfc-description').length).toBe(1);
  });

  it('triggers launch-nfc-authenticator action when button is clicked', function() {
    testContext.init();
    testContext.view.$('.button').click();
    expect(testContext.view.options.appState.trigger).toHaveBeenCalledWith(
      'invokeAction',
      FORMS.LAUNCH_NFC_AUTHENTICATOR,
      expect.objectContaining({ rememberMe: undefined })
    );
  });

  it('passes rememberMe value when button is clicked', function() {
    testContext.init();
    testContext.view.model.set('rememberMe', true);
    testContext.view.$('.button').click();
    expect(testContext.view.options.appState.trigger).toHaveBeenCalledWith(
      'invokeAction',
      FORMS.LAUNCH_NFC_AUTHENTICATOR,
      expect.objectContaining({ rememberMe: true })
    );
  });

  it('sets identifier on settings when identifier is present', function() {
    testContext.init();
    testContext.view.model.set('identifier', 'testuser@example.com');
    testContext.view.$('.button').click();
    expect(settings.get('identifier')).toBe(encodeURIComponent('testuser@example.com'));
  });
});
