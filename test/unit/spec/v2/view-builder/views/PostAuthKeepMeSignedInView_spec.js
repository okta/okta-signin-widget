import { Model } from '@okta/courage';
import PostAuthKeepMeSignedInView from 'v2/view-builder/views/keep-me-signed-in/PostAuthKeepMeSignedInView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import postAuthKeepMeSignedInResponse from '../../../../../../playground/mocks/data/idp/idx/post-auth-keep-me-signed-in';

describe('v2/view-builder/views/keep-me-signed-in/PostAuthKeepMeSignedInView', function() {
  let testContext;
  let language = undefined;
  let appStateTriggerSpy;
  let saveFormSpy;

  beforeEach(function() {
    testContext = {};
    testContext.init = () => {
      const appState = new AppState({}, {});
      appState.set('user', postAuthKeepMeSignedInResponse.user.value);
      appState.set('app', postAuthKeepMeSignedInResponse.app.value);
      appState.set(
        'remediation',
        postAuthKeepMeSignedInResponse.remediation.value
      );

      const settings = new Settings({
        baseUrl: 'http://localhost:3000',
        language
      });
      testContext.view = new PostAuthKeepMeSignedInView({
        appState,
        settings,
        currentViewState: {},
        model: new Model(),
        name: 'captchaVerify.captchaToken'
      });
      testContext.view.render();
      appStateTriggerSpy = jest.spyOn(testContext.view.options.appState, 'trigger');
      saveFormSpy = jest.spyOn(testContext.view.form, 'saveForm');
    };
    jest
      .spyOn(window.document, 'getElementById')
      .mockReturnValue(document.createElement('div'));

    testContext.init();
  });

  afterEach(function() {
    jest.resetAllMocks();
  });

  it('should render properly and have the correct title, subtitle and button labels', () => {
    expect(testContext.view.el).toMatchSnapshot();

    expect(testContext.view.$('h2').text()).toBe('Keep me signed in');
    expect(testContext.view.$('.okta-form-subtitle').text()).toBe('Sign in and enter security methods less frequently.');
    expect(testContext.view.$('[data-se="stay-signed-in-btn"]').text()).toBe('Stay signed in');
    expect(testContext.view.$('[data-se="do-not-stay-signed-in-btn"]').text()).toBe('Don\'t stay signed in');
  });

  [true, false].forEach(isAccept => {
    it('should trigger saveForm with the correct argument when clicking the buttons', () => {
      const button = isAccept ?
        testContext.view.$('[data-se="stay-signed-in-btn"]')
        : testContext.view.$('[data-se="do-not-stay-signed-in-btn"]');
      button.click();
      expect(saveFormSpy).toHaveBeenCalledWith(isAccept);
      expect(appStateTriggerSpy).toHaveBeenLastCalledWith('saveForm', testContext.view.form.model);
    });
  });  
});
