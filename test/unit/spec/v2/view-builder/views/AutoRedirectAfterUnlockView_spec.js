import { Model } from 'okta';
import AutoRedirectView from 'v2/view-builder/views/AutoRedirectView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import SuccessWithAppUserAfterUnlock
from '../../../../../../playground/mocks/data/idp/idx/user-account-unlock-answer-choose-auth-after-unlock.json';

describe('v2/view-builder/views/AutoRedirectViewAfterUnlock', function() {
  let testContext;
  let settings = new Settings({
    baseUrl: 'http://localhost:3000'
  });

  beforeEach(function() {
    testContext = {};
    testContext.init = (user = SuccessWithAppUserAfterUnlock.user.value, app = SuccessWithAppUserAfterUnlock.app.value,
      messages = SuccessWithAppUserAfterUnlock.messages) => {

      const appState = new AppState({}, {});
      appState.set('user', user);
      appState.set('app', app);
      appState.set('messages', messages);

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

  it('renders view after unlock', function() {
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot();
  });
});
