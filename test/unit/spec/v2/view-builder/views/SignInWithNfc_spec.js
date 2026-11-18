import { Model } from '@okta/courage';
import SignInWithNfc from 'v2/view-builder/views/signin/SignInWithNfc';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import { FORMS } from 'v2/ion/RemediationConstants';

describe('v2/view-builder/views/signin/SignInWithNfc', function() {
  const testContext = {};
  const settings = new Settings({
    baseUrl: 'http://localhost:3000'
  });
  beforeEach(function() {
    testContext.init = (launchRemediation = { name: FORMS.LAUNCH_NFC_AUTHENTICATOR }) => {
      const appState = new AppState({
        idx: {
          neededToProceed: [launchRemediation],
        },
      }, {});
      spyOn(appState, 'trigger');

      testContext.view = new SignInWithNfc({
        appState,
        settings,
        currentViewState: {},
        model: new Model(),
      });
      testContext.view.render();
    };
  });
  afterEach(function() {
    jest.resetAllMocks();
  });

  it('should render the default button label', function() {
    testContext.init();
    expect(testContext.view.$('.button').text()).toBe('Sign in with NFC');
  });

  it('should render the custom button label when customAuthenticatorName is provided', function() {
    testContext.init({ name: FORMS.LAUNCH_NFC_AUTHENTICATOR, customAuthenticatorName: 'Badge' });
    expect(testContext.view.$('.button').text()).toBe('Sign in with Badge');
  });

  it('should render the default button label when customAuthenticatorName is blank', function() {
    testContext.init({ name: FORMS.LAUNCH_NFC_AUTHENTICATOR, customAuthenticatorName: '  ' });
    expect(testContext.view.$('.button').text()).toBe('Sign in with NFC');
  });

  it('should launch nfc authenticator when button is clicked', function() {
    testContext.init();
    testContext.view.$('.button').click();
    expect(testContext.view.options.appState.trigger).toHaveBeenCalledWith(
      'invokeAction',
      FORMS.LAUNCH_NFC_AUTHENTICATOR,
      expect.objectContaining({ rememberMe: undefined })
    );
  });
});
