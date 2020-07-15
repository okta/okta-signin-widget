import IdentifierView from 'v2/view-builder/views/IdentifierView';
import AppState from 'v2/models/AppState';
import $sandbox from 'sandbox';
import Settings from 'models/Settings';
import IdentifyWithPasswordResponse from '../../../../../../playground/mocks/data/idp/idx/identify-with-password.json';

describe('Identifier View shows custom links configured via config on load', function () {
  beforeEach(function () {
    this.init = (response, formName, View) => {
      const currentViewState = {
        name: formName,
      };
      const appStateConfig = {
        remediations: response.remediation.value,
        // mock signout link
        idx: {
          actions: {
            'cancel': function () {}
          }
        }
      };
      if (response.currentAuthenticator) {
        appStateConfig.currentAuthenticator =response.currentAuthenticator.value;
      }
      const appState = new AppState(appStateConfig);
      const settings = new Settings({
        'baseUrl': 'http://localhost:3000',
        'logo': '/img/logo_widgico.png',
        'logoText': 'Custom Logo text',
        'features': {
          'router': true,
        },
        'helpLinks.help': 'https://google.com',
        'helpLinks.custom': [
          {
            'text': 'What is Okta?',
            'href': 'https://acme.com/what-is-okta'
          },
          {
            'text': 'Acme Portal',
            'href': 'https://acme.com',
            'target': '_blank'
          }
        ],
        'helpLinks.forgotPassword': 'https://okta.okta.com/signin/forgot-password',
        'signOutLink': 'https://okta.okta.com/',
        'apiVersion': '1.0.0',
        'stateToken': '02n1zv90dJ5QIFLyR3r7zEo0nepmZ09OC9j2S1IN6O',
      });
      spyOn(appState,'hasRemediationObject').and.callFake((formName) => formName === 'select-enroll-profile');
      spyOn(appState,'getActionByPath').and.callFake(() => true);
      this.view = new View({
        el: $sandbox,
        appState,
        currentViewState,
        settings
      });
      this.view.render();
    };
  });

  afterEach(function () {
    $sandbox.empty();
  });

  it('Shows the correct custom footer links', function () {
    this.init(IdentifyWithPasswordResponse, 'identify', IdentifierView);
    expect(this.view.$('.auth-footer .link').length).toBe(6);
    expect(this.view.$('.auth-footer .js-help').text()).toBe('Help');
    expect(this.view.$('.auth-footer .js-help').attr('href')).toBe('https://google.com');

    expect(this.view.$('.auth-footer .js-forgot-password').text()).toBe('Forgot password?');
    expect(this.view.$('.auth-footer .js-forgot-password').attr('href')).toBe('https://okta.okta.com/signin/forgot-password');

    expect(this.view.$('.auth-footer .js-custom').length).toBe(2);
    
    expect(this.view.$('.auth-footer .js-custom').eq(0).text()).toBe('What is Okta?');
    expect(this.view.$('.auth-footer .js-custom').eq(0).attr('href')).toBe('https://acme.com/what-is-okta');

    expect(this.view.$('.auth-footer .js-custom').eq(1).text()).toBe('Acme Portal');
    expect(this.view.$('.auth-footer .js-custom').eq(1).attr('href')).toBe('https://acme.com');

    expect(this.view.$('.auth-footer .js-custom').eq(1).text()).toBe('Acme Portal');
    expect(this.view.$('.auth-footer .js-custom').eq(1).attr('href')).toBe('https://acme.com');

    expect(this.view.$('.auth-footer .js-cancel').attr('href')).toBe('https://okta.okta.com/');
  });
});
