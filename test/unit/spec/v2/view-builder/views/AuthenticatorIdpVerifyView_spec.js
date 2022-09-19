import AuthenticatorIdPVerifyView from 'v2/view-builder/views/idp/AuthenticatorIdPVerifyView';
import AuthenticatorIdPEnrollView from 'v2/view-builder/views/idp/AuthenticatorIdPEnrollView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import IdpAuthenticatorVerifyResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-idp.json';
import IdpAuthenticatorEnrollResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-idp.json';

describe('v2/view-builder/views/idp/AuthenticatorIdPVerifyView', function() {
  let testContext;
  let appStateTriggerSpy;
  beforeEach(function() {
    testContext = {};
    testContext.init = (
      requestName = 'Verification',
      skipIdpFactorVerification = false,
      isFailure = false
    ) => {
      let isVerify = requestName === 'Verification';
      let currentAuthenticator =  isVerify ? IdpAuthenticatorVerifyResponse.currentAuthenticator.value :
        IdpAuthenticatorEnrollResponse.currentAuthenticator.value;
      let authenticatorEnrollments = [];
      let app = {};
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments,
        app
      }, {});

      if (isFailure) {
        appState.set('messages', {
          'value': [
            {
              'message': 'Authentication failed. Please try again.',
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
      }

      jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockReturnValue(formName => {
        if (formName === 'select-authenticator-authenticate') {
          return [ { label: 'some authenticator '} ];
        }
        return [];
      });

      const settings = new Settings({ baseUrl: 'http://localhost:3000', 'features.skipIdpFactorVerificationBtn': skipIdpFactorVerification });
      const currentViewState = {
        name: 'challenge-authenticator',
        relatesTo: {
          value: currentAuthenticator,
        },
      };
      const ViewClass = isVerify ? AuthenticatorIdPVerifyView : AuthenticatorIdPEnrollView;
      testContext.view = new ViewClass({
        el: $sandbox,
        appState,
        settings,
        currentViewState,
      });
      appStateTriggerSpy = jest.spyOn(testContext.view.options.appState, 'trigger');
      testContext.view.render();
    };
  });

  afterEach(function() {
    $sandbox.empty();
  });

  it.each(['Verification', 'Enrollment']) ('shows idp authenticator %s screen with ' +
        'SKIP_IDP_FACTOR_VERIFICATION_BUTTON disabled', function(requestName) {
    testContext.init(requestName);
    if (requestName === 'Verification') {
      expect(testContext.view.$('.okta-form-subtitle').text()).toBe(
        'You will be redirected to verify with IDP Authenticator'
      );
    } else {
      expect(testContext.view.$('.okta-form-subtitle').text()).toBe(
        'Clicking below will redirect to enrollment in IDP Authenticator'
      );
    }
    expect(testContext.view.$('.o-form-button-bar').css('display')).toBe('block');
    expect(testContext.view.$('.okta-waiting-spinner').css('display')).toBe('none');
    expect(appStateTriggerSpy).toHaveBeenCalledTimes(0);
  });

  it.each(['Verification', 'Enrollment']) ('auto-submit idp authenticator %s screen with SKIP_IDP_FACTOR_VERIFICATION_BUTTON enabled', function(requestName) {

    testContext.init(requestName, true);
    if (requestName === 'Verification') {
      expect(testContext.view.$('.okta-form-subtitle').text()).toBe(
        'You will be redirected to verify with IDP Authenticator'
      );
    } else {
      expect(testContext.view.$('.okta-form-subtitle').text()).toBe(
        'Clicking below will redirect to enrollment in IDP Authenticator'
      );
    }
    expect(testContext.view.$('.okta-waiting-spinner').css('display')).toBe('block');
    // make sure save form is called.
    expect(appStateTriggerSpy).toHaveBeenCalledWith('saveForm', testContext.view.model);
    expect(appStateTriggerSpy).toHaveBeenCalledTimes(1);
  });

  it.each(['Verification', 'Enrollment']) ('show error messages and no auto-submit idp authenticator %s screen with SKIP_IDP_FACTOR_VERIFICATION_BUTTON ' +
        'enabled in case of failure', function(requestName) {

    testContext.init(requestName, true, true);
    if (requestName === 'Verification') {
      expect(testContext.view.$('.okta-form-subtitle').text()).toBe(
        'You will be redirected to verify with IDP Authenticator'
      );
    } else {
      expect(testContext.view.$('.okta-form-subtitle').text()).toBe(
        'Clicking below will redirect to enrollment in IDP Authenticator'
      );
    }
    expect(testContext.view.$('.okta-waiting-spinner').css('display')).toBe('none');
    expect(testContext.view.$('.o-form-button-bar').css('display')).toBe('block');
    // make sure no save form is called in case of error.
    expect(appStateTriggerSpy).toHaveBeenCalledTimes(0);
  });
});
