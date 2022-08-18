import { Model } from 'okta';
import SignInWithWebAuthn from 'v2/view-builder/views/signin/SignInWithWebAuthn';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import { FORMS } from 'v2/ion/RemediationConstants';

describe('v2/view-builder/views/signin/SignInWithWebAuthn', function() {
  const testContext = {};
  const settings = new Settings({ 
    baseUrl: 'http://localhost:3000'
  });  
  beforeEach(function() { 
    testContext.init = () => {
      const appState = new AppState({}, {});
      spyOn(appState, 'trigger');

      testContext.view = new SignInWithWebAuthn({
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

  it('should render the signin with biometric button', function() {
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot();
  });

  it('should launchwebauthn when button is clicked', function() {
    testContext.init();
    testContext.view.$('.link-button-icon').click();
    expect(testContext.view.options.appState.trigger).toHaveBeenCalledWith('invokeAction', FORMS.LAUNCH_WEBAUTHN_AUTHENTICATOR);
  });
});
