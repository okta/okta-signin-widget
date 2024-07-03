import { waitForLoad } from '../util/waitUtil';
import PrimaryAuthPage  from './primary-auth.page';

const { WIDGET_TEST_SERVER, BUNDLE, USE_MIN } = process.env;

class TestAppPage {
  get widget() { return $('#okta-sign-in'); }
  get configEditor() { return $('#config-editor'); }
  get tokens() { return $('#tokens-container'); }
  get code() { return $('#code-container'); }
  get cspErrors() { return $('#csp-errors-container'); }
  get unhandledRejections() { return $('#unhandled-rejections-container'); }
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
  get triggerCspEvalFail() { return $('button[name="fail-csp-eval"]'); }
  get triggerCspStyleAttrFail() { return $('button[name="fail-csp-style-attr"]'); }
  get flowDropdown() { return $('#f_flow'); }
  get clearTransactionButton() { return $('button[name="clearTransaction"]'); }

  
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

  async switchToPreviousTab() {
    const windowHandles = await browser.getWindowHandles();
    const previousHandle = windowHandles.slice(-2)[0];
    await browser.switchToWindow(previousHandle);
  }

  async ssoLogout() {
    await browser.url(`${WIDGET_TEST_SERVER}/login/signout`);
  }

  async setConfig(config) {
    await waitForLoad(this.configEditor);
    const $configEditor = await this.configEditor;
    await $configEditor.setValue(JSON.stringify(config));
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
    await this.widget.waitForDisplayed({ reverse: !displayed });
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

  async assertNoUnhandledRejections() {
    await this.unhandledRejections.then(el => el.getText()).then(txt => {
      expect(txt).toBe('');
    });
  }

  async clearTransaction() {
    await this.clearTransactionButton.click();
  }

}

export default new TestAppPage();
