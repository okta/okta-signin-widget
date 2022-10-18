import { Model } from 'okta';
import EnrollWebAuthnResidentkeyLinkView from 'v2/view-builder/views/webauthn/EnrollWebAuthnResidentkeyLinkView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import { FORMS } from 'v2/ion/RemediationConstants';

describe('v2/view-builder/views/webauthn/EnrollWebAuthnResidentkeyLinkView', function() {
  const testContext = {};
  const settings = new Settings({ 
    baseUrl: 'http://localhost:3000'
  });  
  beforeEach(function() { 
    testContext.init = () => {
      const appState = new AppState({}, {});
      spyOn(appState, 'trigger');

      testContext.view = new EnrollWebAuthnResidentkeyLinkView({
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

  it('should render the enroll webauthn text', function() {
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot();
  });

  it('should enroll webauthn when button is clicked', function() {
    testContext.init();
    testContext.view.$('.setup-webauthn-residentkey-link').click();
    expect(testContext.view.options.appState.trigger).toHaveBeenCalledWith('invokeAction', FORMS.ENROLL_WEBAUTHN_RESIDENTKEY);
  });
});
