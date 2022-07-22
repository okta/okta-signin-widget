import { Model } from 'okta';
import AutoRedirectView from 'v2/view-builder/views/AutoRedirectView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import SuccessWithAppUser
  from '../../../../../../playground/mocks/data/idp/idx/success-with-app-user.json';
import { INTERSTITIAL_REDIRECT_VIEW } from 'v2/ion/RemediationConstants';


describe('v2/view-builder/views/AutoRedirectView', function() {
  let testContext;
  let settings = new Settings({ 
    baseUrl: 'http://localhost:3000'
  });  
  beforeEach(function() { 
    testContext = {};
    testContext.init = (user = SuccessWithAppUser.user.value, app = SuccessWithAppUser.app.value) => {
      const appState = new AppState({}, {});
      appState.set('user', user);
      appState.set('app', app);

      testContext.view = new AutoRedirectView({
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

  it('view renders corectly - default case', function() {
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot();
  });

  it('view renders correctly according to interstitialBeforeLoginRedirect', function() {
    settings = new Settings({ 
      baseUrl: 'http://localhost:3000',
      'interstitialBeforeLoginRedirect': INTERSTITIAL_REDIRECT_VIEW.NONE
    });    
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot('should NOT render spinner');
    

    settings = new Settings({ 
      baseUrl: 'http://localhost:3000',
      'interstitialBeforeLoginRedirect': INTERSTITIAL_REDIRECT_VIEW.DEFAULT
    });    
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot('should have spinner, app name, and user identifier');
  });


  it('renders user identifier in title when features.showIdentifier is false', function() {
    settings = new Settings({
      baseUrl: 'http://localhost:3000',
      'interstitialBeforeLoginRedirect': INTERSTITIAL_REDIRECT_VIEW.DEFAULT,
      'features.showIdentifier': false,
    });
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot('should show identifier in title');
  });
});
