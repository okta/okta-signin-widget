import { Model } from 'okta';
import AutoRedirectView from 'v2/view-builder/views/AutoRedirectView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import SuccessWithAppUser
  from '../../../../../../playground/mocks/data/idp/idx/success-with-app-user.json';

describe('v2/view-builder/views/AutoRedirectView', function() {
  let testContext;
  let settings = new Settings({ 
    baseUrl: 'http://localhost:3000'
  });  
  beforeEach(function() { 
    testContext = {};
    testContext.init = (user = SuccessWithAppUser.user.value, app = SuccessWithAppUser.app.value) => {
      const appState = new AppState();
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
      'interstitialBeforeLoginRedirect': 'NONE'
    });    
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot('should NOT render spinner');
    

    settings = new Settings({ 
      baseUrl: 'http://localhost:3000',
      'interstitialBeforeLoginRedirect': 'DEFAULT'
    });    
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot('should have spinner');
  });
});
