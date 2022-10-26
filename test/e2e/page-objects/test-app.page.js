import { waitForLoad } from '../util/waitUtil';
import PrimaryAuthPage  from './primary-auth.page';

const { WIDGET_TEST_SERVER, BUNDLE, USE_MIN } = process.env;

class TestAppPage {
  get widget() { return $('#okta-sign-in'); }
  get configEditor() { return $('#config-editor'); }
  get tokens() { return $('#tokens-container'); }
  get code() { return $('#code-container'); }
  get cspErrors() { return $('#csp-errors-container'); }
  get oidcError() { return $('#oidc-error-container'); }
  // widget general elements
  get widgetTitle() { return $('[data-se="o-form-head"]'); }
  get submit() { return $('[data-type="save"]'); }

  // actions
  get startButton() { return $('button[name="start"]'); }
  get hideButton() { return $('button[name="hide"]'); }
  get showButton() { return $('button[name="show"]'); }
  get removeButton() { return $('button[name="remove"]'); }
  get showSignInButton() { return $('button[name="showSignIn"]'); }
  get showSignInAndRedirect() { return $('button[name="showSignInAndRedirect"]'); }
  get showSignInToGetTokens() { return $('button[name="showSignInToGetTokens"]'); }
  get startWithRenderEl() { return $('button[name="renderEl"]'); }
  get triggerCspFail() { return $('button[name="fail-csp"]'); }
  get flowDropdown() { return $('#f_flow'); }

  
  async open(path = '') {
    const extraConfig = {};

    if (BUNDLE) {
      extraConfig.bundle = BUNDLE;
    }
    if (USE_MIN) {
      extraConfig.useMinBundle = true;
    }

    let queryStr = '';
    if (Object.keys(extraConfig).length > 0) {
      const configStr = encodeURIComponent(JSON.stringify(extraConfig));
      queryStr = `?config=${configStr}`;
    }
    const url = `http://localhost:3000/${path}${queryStr}`;
    return browser.url(url);
  }

  async openInNewTab(path = '') {
    await browser.newWindow(`http://localhost:3000/${path}`, { windowFeatures: 'noopener=yes' });
  }

  async ssoLogout() {
    await browser.url(`${WIDGET_TEST_SERVER}/login/signout`);
  }

  async setConfig(config) {
    try {
      await this.configEditor.then(el => el.setValue(JSON.stringify(config)));
    } catch (err) {
      browser.refresh();
      console.log('retry setting config');
      await this.configEditor.then(el => el.setValue(JSON.stringify(config)));
    }
  }

  async getCspErrors() {
    return this.cspErrors.then(el => el.getText());
  }

  async getOIDCError() {
    return this.oidcError.then(el => el.getText());
  }

  async assertOIDCError(expectedError) {
    await waitForLoad(this.oidcError);
    await this.oidcError.then(el => el.getText()).then(txt => {
      expect(txt).toEqual(expectedError);
    });
  }

  async assertIDToken(username) {
    await waitForLoad(this.tokens);
    await this.tokens.then(el => el.getText()).then(txt => {
      expect(txt).toContain('idToken');
      expect(txt).toContain(`"name": "${username}"`);
    });
  }

  async assertAccessToken() {
    await waitForLoad(this.tokens);
    await this.tokens.then(el => el.getText()).then(txt => {
      expect(txt).toContain('accessToken');
      expect(txt).toContain('"tokenType": "Bearer"');
    });
  }

  async assertCode() {
    await waitForLoad(this.code);
    await this.code.then(el => el.getText()).then(txt => {
      expect(txt.length).toBeGreaterThan(0);
    });
  }

  async assertWidget(displayed) {
    if (displayed) {
      await waitForLoad(this.widget);
    }
    await this.widget.then(el => el.isDisplayed()).then(isDisplayed => {
      expect(isDisplayed).toBe(displayed);
    });
  }

  async assertWidgetRemoved() {
    await this.widget.then(el => el.isExisting()).then(isExisting => {
      expect(isExisting).toBeFalsy();
    });
  }

  async assertWidgetCustomTitle() {
    await this.widgetTitle.then(el => el.getText()).then(txt => {
      expect(txt).toBe('Sign In to Acme');
    });
  }

  async assertWidgetBackgroundColor() {
    await this.submit.scrollIntoView();
    await this.submit.then(el => el.getCSSProperty('background-color')).then(background => {
      expect(background.value).toContain('rgba(0,128,0,1)');
    });
  }

  async assertCSPError(expectedError) {
    await waitForLoad(this.cspErrors);
    await this.cspErrors.then(el => el.getText()).then(txt => {
      expect(txt).toEqual(expectedError);
    });
  }

  async assertWidgetUnableToSignin() {
    await PrimaryAuthPage.errorBox.then(el => el.getText()).then(txt => {
      expect(txt).toBe('Unable to sign in');
    });
  }

  async assertWidgetSigninError(errorMessage) {
    await PrimaryAuthPage.errorBox.then(el => el.getText()).then(txt => {
      expect(txt).toBe(errorMessage);
    });
  }

}

export default new TestAppPage();
