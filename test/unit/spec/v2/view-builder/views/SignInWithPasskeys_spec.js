import { Model } from '@okta/courage';
import SignInWithPasskeys from 'v2/view-builder/views/signin/SignInWithPasskeys';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';

describe('v2/view-builder/views/signin/SignInWithPasskeys', function() {
  const testContext = {};
  const settings = new Settings({
    baseUrl: 'http://localhost:3000'
  });
  beforeEach(function() {
    testContext.init = (overrides = {}) => {
      const appState = new AppState({}, {});
      spyOn(appState, 'trigger');

      testContext.view = new SignInWithPasskeys({
        appState,
        settings,
        currentViewState: {},
        model: new Model(),
        formView: {},
        getCredentialsAndInvokeAction: jest.fn(),
        ...overrides,
      });
      testContext.view.render();
    };
  });
  afterEach(function() {
    jest.resetAllMocks();
  });

  it('should render the signin with a passkey button', function() {
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot();
  });

  it('should launch passkey flow when button is clicked', function() {
    const formView = {};
    const getCredentialsAndInvokeAction = jest.fn(function() {
      expect(this).toBe(formView);
    });

    testContext.init({ formView, getCredentialsAndInvokeAction });
    testContext.view.$('.link-button-icon').click();

    expect(getCredentialsAndInvokeAction).toHaveBeenCalledTimes(1);
  });

});
