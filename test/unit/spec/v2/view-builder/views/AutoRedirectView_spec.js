import { Model } from '@okta/courage';
import AutoRedirectView from 'v2/view-builder/views/AutoRedirectView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import Util from 'util/Util';
import SuccessWithAppUser from '../../../../../../playground/mocks/data/idp/idx/success-with-app-user.json';
import { INTERSTITIAL_REDIRECT_VIEW } from 'v2/ion/RemediationConstants';

describe('v2/view-builder/views/AutoRedirectView', function() {
  let testContext;
  let settings = new Settings({
    baseUrl: 'http://localhost:3000',
    'interstitialBeforeLoginRedirect': null
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

  it('renders custom error message', function() {
    settings = new Settings({
      baseUrl: 'http://localhost:3000',
      'interstitialBeforeLoginRedirect': INTERSTITIAL_REDIRECT_VIEW.DEFAULT,
    });
    const appState = new AppState({}, {});
    appState.set('messages', {
      'value': [
        {
          'message': 'You do not have permission to perform the requested action.',
          'links': [
            {'label': 'Help link 1', 'url': 'https://www.okta.com/'},
            {'label': 'Help link 2', 'url': 'https://www.okta.com/help?page=1'}
          ],
          'i18n': {
            'key': 'security.access_denied_custom_message'
          },
          'class': 'ERROR'
        }
      ]
    });
    testContext.view = new AutoRedirectView({
      appState,
      settings,
      currentViewState: {},
      model: new Model(),
    });
    testContext.view.render();

    expect(testContext.view.$el.html()).toMatchSnapshot();
  });

  describe('OKTA-1182955: post AppLink verification renders Continue button', function() {
    const REDIRECT_HREF = 'http://localhost:3000/redirect-target';

    const initWithViewState = (viewState) => {
      const appState = new AppState({}, {});
      appState.set('user', SuccessWithAppUser.user.value);
      appState.set('app', SuccessWithAppUser.app.value);
      appState.set('currentFormName', 'success-redirect');
      appState.set('remediations', [viewState]);

      testContext.view = new AutoRedirectView({
        appState,
        settings: new Settings({
          baseUrl: 'http://localhost:3000',
          'interstitialBeforeLoginRedirect': INTERSTITIAL_REDIRECT_VIEW.DEFAULT,
        }),
        currentViewState: {},
        model: new Model(),
      });
      testContext.view.render();
    };

    it('renders the Continue button and hides the auto-redirect spinner', function() {
      initWithViewState({
        name: 'success-redirect',
        href: REDIRECT_HREF,
        priorVerification: { method: 'APP_LINK', success: true },
      });

      expect(testContext.view.$el.find('#applink-continue-redirect').length).toBe(1);
      expect(testContext.view.$el.find('#applink-continue-redirect').text()).toBe('Continue');
      expect(testContext.view.$el.find('.okta-waiting-spinner').length).toBe(0);
    });

    it('clicking the Continue button triggers Util.redirectWithFormGet with the success href', function() {
      const redirectSpy = jest.spyOn(Util, 'redirectWithFormGet').mockImplementation(() => {});
      initWithViewState({
        name: 'success-redirect',
        href: REDIRECT_HREF,
        priorVerification: { method: 'APP_LINK', success: true },
      });

      testContext.view.$el.find('#applink-continue-redirect').click();

      expect(redirectSpy).toHaveBeenCalledTimes(1);
      expect(redirectSpy).toHaveBeenCalledWith(REDIRECT_HREF);
    });

    it('renders spinner (no Continue button) when priorVerification is absent', function() {
      initWithViewState({
        name: 'success-redirect',
        href: REDIRECT_HREF,
      });

      expect(testContext.view.$el.find('#applink-continue-redirect').length).toBe(0);
      expect(testContext.view.$el.find('.okta-waiting-spinner').length).toBe(1);
    });

    it('renders spinner (no Continue button) when method is not APP_LINK', function() {
      initWithViewState({
        name: 'success-redirect',
        href: REDIRECT_HREF,
        priorVerification: { method: 'LOOPBACK', success: true },
      });

      expect(testContext.view.$el.find('#applink-continue-redirect').length).toBe(0);
      expect(testContext.view.$el.find('.okta-waiting-spinner').length).toBe(1);
    });
  });
});
