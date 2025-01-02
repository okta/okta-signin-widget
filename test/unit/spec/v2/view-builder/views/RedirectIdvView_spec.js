import RedirectIdvView from 'v2/view-builder/views/idp/RedirectIdvView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import PersonaIdvResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-persona.json';
import ClearIdvResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-clear.json';
import IncodeIdvResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-idp-with-incode.json';
import { loc } from '@okta/courage';

describe('v2/view-builder/views/idp/RedirectIdvView', function() {
  let testContext;
  let appStateTriggerSpy;

  beforeEach(function() {

    testContext = {};
    testContext.init = (skipIdpFactorVerificationBtn = false, idvName = 'Persona') => {
      let currentAuthenticator =  [];
      let authenticatorEnrollments = {};
      let settings = new Settings({ baseUrl: 'http://localhost:3000', 'features.skipIdpFactorVerificationBtn': skipIdpFactorVerificationBtn });
      let app = {};
      let idvResponse;
      switch (idvName) {
      case 'Persona':
        idvResponse = PersonaIdvResponse;
        break;
      case 'Clear':
        idvResponse = ClearIdvResponse;
        break;
      case 'Incode':
        idvResponse = IncodeIdvResponse;
        break;
      }
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments,
        remediations: idvResponse.remediation.value,
        app
      }, {});

      jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockReturnValue(formName => {
        if (formName === 'select-authenticator-authenticate') {
          return [ { label: 'some authenticator '} ];
        }
        return [];
      });

      appStateTriggerSpy = jest.spyOn(appState, 'trigger');

      const currentViewState = {
        name: 'redirect-idverify',
      };
      testContext.view = new RedirectIdvView({
        appState,
        settings,
        currentViewState,
      });
      testContext.view.render();
    };
  });

  it.each(['Persona', 'Clear', 'Incode'])('view renders content correctly for Redirect IDV page for %s', async (idvName) => {
    testContext.init(false, idvName);

    expect(testContext.view.$el.find('.okta-form-title').text()).toBe(loc('oie.idv.idp.title', 'login', [idvName]));
    expect(testContext.view.$el.find('.okta-form-subtitle').text()).toBe(loc('oie.idv.idp.desc', 'login', [idvName]));
    expect(testContext.view.$el.find('.o-form-button-bar input').attr('value')).toBe(loc('oie.optional.authenticator.button.title', 'login'));
    expect(testContext.view.$el.find('[data-se="terms-of-use"]').attr('href')).toMatchSnapshot();
    expect(testContext.view.$el.find('[data-se="privacy-policy"]').attr('href')).toMatchSnapshot();
  });

  it.each([true, false])('Do not hide button and auto redirect when skipIdpFactorVerificationBtn is %s', async (skipIdpFactorVerificationBtn) => {
    testContext.init(skipIdpFactorVerificationBtn);
    expect(testContext.view.$el.find('.o-form-button-bar').attr('style')).toBeUndefined();
    expect(appStateTriggerSpy).toHaveBeenCalledTimes(0);
  });

});
