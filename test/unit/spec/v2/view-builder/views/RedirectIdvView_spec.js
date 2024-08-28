import RedirectIdvView from 'v2/view-builder/views/idp/RedirectIdvView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import IdvResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-persona.json';
import { loc } from '@okta/courage';

describe('v2/view-builder/views/idp/RedirectIdvView', function() {
  let testContext;
  let settings = new Settings({ baseUrl: 'http://localhost:3000' });

  beforeEach(function() {

    testContext = {};
    testContext.init = (
    ) => {
      let currentAuthenticator =  [];
      let authenticatorEnrollments = {};
      let app = {};
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments,
        remediations: IdvResponse.remediation.value,
        app
      }, {});

      jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockReturnValue(formName => {
        if (formName === 'select-authenticator-authenticate') {
          return [ { label: 'some authenticator '} ];
        }
        return [];
      });

      const currentViewState = {
        name: 'challenge-authenticator',
        relatesTo: {
          value: currentAuthenticator,
        },
      };
      testContext.view = new RedirectIdvView({
        appState,
        settings,
        currentViewState,
      });
      testContext.view.render();
    };
  });

  it('view renders content correctly for Redirect IDV page', async () => {
    testContext.init();

    expect(testContext.view.$el.find('.okta-form-title').text()).toBe(loc('oie.idv.idp.title', 'login', ['Persona']));
    expect(testContext.view.$el.find('.okta-form-subtitle').text()).toBe(loc('oie.idv.idp.description', 'login'));
    expect(testContext.view.$el.find('.o-form-button-bar input').attr('value')).toBe(loc('oie.optional.authenticator.button.title', 'login'));
  });

});