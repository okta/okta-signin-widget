import { Model, $ } from 'okta';
import IdentifierView from 'v2/view-builder/views/IdentifierView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import XHRIdentifyWithPassword
  from '../../../../../../playground/mocks/data/idp/idx/identify-with-password.json';
import XHRIdentifyWithThirdPartyIdps
  from '../../../../../../playground/mocks/data/idp/idx/identify-with-third-party-idps.json';

describe('v2/view-builder/views/IdentifierView', function() {
  let testContext;
  let idpDisplay = undefined;

  beforeEach(function() { 
    testContext = {};
    testContext.init = (remediations = XHRIdentifyWithThirdPartyIdps.remediation.value) => {
      const appState = new AppState();
      appState.set('remediations', remediations);
      const settings = new Settings({ 
        baseUrl: 'http://localhost:3000',
        idpDisplay
      });
      testContext.view = new IdentifierView({
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

  it('view renders forgot password link correctly with mutiple IDPs', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init();

    // The forgot password link should NOT be in the siw-main-footer and should be in .links-primary
    expect(testContext.view.$el.find('.links-primary .js-forgot-password').length).toEqual(1);
    expect(testContext.view.$el.find('.siw-main-footer .js-forgot-password').length).toEqual(0);
  });

  it('view renders forgot password link correctly with no IDPs', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init(XHRIdentifyWithPassword.remediation.value);
    
    // The forgot password link should be in the siw-main-footer
    expect(testContext.view.$el.find('.siw-main-footer .js-forgot-password').length).toEqual(1);
    expect(testContext.view.$el.find('.links-primary .js-forgot-password').length).toEqual(0);
  });

  it('view renders IDP buttons correctly with idpDisplay property', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init();

    // The idp buttons should be rendered below the main login fields when no idpDisplay defined.
    expect(testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp').length).toEqual(1);
    expect(testContext.view.$el.find('.o-form-fieldset-container .sign-in-with-idp').length).toEqual(0);

    idpDisplay = 'PRIMARY';
    testContext.init();

    // The idp buttons should be rendered above the main login fields when idpDisplay is PRIMARY.
    expect(testContext.view.$el.find('.o-form-fieldset-container .sign-in-with-idp').length).toEqual(1);
    expect(testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp').length).toEqual(0);

    idpDisplay = 'SECONDARY';
    testContext.init();

    // The idp buttons should be rendered below the main login fields when idpDisplay is SECONDARY.
    expect(testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp').length).toEqual(1);
    expect(testContext.view.$el.find('.o-form-fieldset-container .sign-in-with-idp').length).toEqual(0);
  });

  it('view renders no IDP buttons with no IDPs in the remediation', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init(XHRIdentifyWithPassword.remediation.value);
    
    // No IDP buttons should be rendered.
    expect(testContext.view.$el.find('.o-form-fieldset-container .sign-in-with-idp').length).toEqual(0);
    expect(testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp').length).toEqual(0);
  });

  it('view renders IDP buttons correctly with tooltip', function() {
    jest.spyOn(AppState.prototype, 'hasRemediationObject').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'getActionByPath').mockReturnValue(true);
    jest.spyOn(AppState.prototype, 'isIdentifierOnlyView').mockReturnValue(false);
    testContext.init();

    // Get the idp buttons
    const buttons = testContext.view.$el.find('.o-form-button-bar .sign-in-with-idp .social-auth-button.link-button');

    // Ensure the button tooltip is equal to the button title
    buttons.each(function(){
      expect($(this).attr('title')).toEqual($(this).text());
    });
  });
});
