import RedirectIdvView from 'v2/view-builder/views/idp/RedirectIdvView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import IdvResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-persona.json';
import { loc } from '@okta/courage';

describe('v2/view-builder/views/idp/AuthenticatorIdPVerifyView', function() {
  let testContext;
  let settings = new Settings({ baseUrl: 'http://localhost:3000' });
  let appStateTriggerSpy;

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
        // el: $sandbox,
        appState,
        settings,
        currentViewState,
      });
      testContext.view.render();
      appStateTriggerSpy = jest.spyOn(testContext.view.options.appState, 'trigger');
    };
  });

  it('view renders content correctly for Redirect IDV page', async () => {
    testContext.init();

    expect(testContext.view.$el.find('.okta-form-title').text()).toBe(loc('oie.idv.idp.title', 'login', ['Persona']));
    expect(testContext.view.$el.find('.okta-form-subtitle').text()).toBe(loc('oie.idv.idp.description', 'login'));
    expect(testContext.view.$el.find('.o-form-button-bar input').attr('value')).toBe(loc('oie.optional.authenticator.button.title', 'login'));
    testContext.view.$el.find('.o-form-button-bar input').click();
    expect(appStateTriggerSpy).toHaveBeenCalledWith('saveForm', testContext.view.model);
  });

});
