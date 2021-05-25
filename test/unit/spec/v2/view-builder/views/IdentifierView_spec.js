import { Model } from 'okta';
import IdentifierView from 'v2/view-builder/views/IdentifierView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import XHRIdentifyWithPassword
  from '../../../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import XHRIdentifyWithThirdPartyIdps
  from '../../../../../../playground/mocks/data/idp/idx/identify-with-third-party-idps.json';

describe('v2/view-builder/views/CaptchaView', function() {
  let testContext;
  beforeEach(function() { 
    testContext = {};
    testContext.init = (remediations = XHRIdentifyWithThirdPartyIdps.remediation.value) => {
      const appState = new AppState();
      appState.set('remediations', remediations);
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      testContext.view = new IdentifierView({
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

  it('view renders forgot password link correctly with mutiple IDPs', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init();

    // The forgot password link should NOT be in the siw-main-footer
    expect(testContext.view.el).toMatchSnapshot('With Multiple IDPs');
  });

  it('view renders forgot password link correctly with no IDPs', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init(XHRIdentifyWithPassword.remediation.value);
    
    // The forgot password link should be in the siw-main-footer
    expect(testContext.view.el).toMatchSnapshot('With Multiple IDPs');
  });
});
