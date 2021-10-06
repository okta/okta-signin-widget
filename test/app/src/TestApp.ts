import { AuthSdkError, OktaAuth, Tokens } from '@okta/okta-auth-js';
// @ts-ignore
import getOktaSignIn from './getOktaSignIn';

const ConfigTemplate = `
  <div id="config-container">
    <h3>Config</h3>
    <h4>Editor (JSON format)</h4>
    <textarea id="config-editor"></textarea>
    <h4>Config Preview</h4>
    <pre id="config-preview"></pre>
  </div>
`;

const ActionsTemplate = `
  <div id="actions-container">
    <h3>Widget UI Actions</h3>
    <button name="start">Start</button>
    <button name="hide">Hide</button>
    <button name="show">Show</button>
    <button name="remove">Remove</button>
    <button name="showSignInAndRedirect">
      Start Widget with showSignInAndRedirect
    </button>
    <button name="showSignInToGetTokens">
      Start Widget with showSignInToGetTokens
    </button>
    <button name="renderEl">
      Start Widget with RenderEl
    </button>
    <button name="fail-csp">
      Trigger CSP Fail
    </button>
  </div>
`;

const TokensTemplate = `
  <pre id="tokens-container"></pre>
`;

const CodeTemplate = `
  <div id="code-container"></div>
`;

const CSPErrorsTemplate = `
  <div id="csp-errors-container"></div>
`;

const OIDCErrorTemplate = `
  <div id="oidc-error-container"></div>
`;

const LayoutTemplate = `
  <div id="layout">
    <h2>Sign-In-Widget test pages</h2>
    ${ConfigTemplate}
    ${ActionsTemplate}
    ${TokensTemplate}
    ${CodeTemplate}
    ${CSPErrorsTemplate}
    ${OIDCErrorTemplate}
  </div>
`;

export default class TestApp {
  authClient: OktaAuth;
  oktaSignIn: any;
  cspErrors: SecurityPolicyViolationEvent[] = [];

  // config
  configEditor: Element;
  configPreview: Element;
  // action buttons
  startButton: Element;
  hideButton: Element;
  showButton: Element;
  removeButton: Element;
  showSignInAndRedirectButton: Element;
  showSignInToGetTokensButton: Element;
  renderElButton: Element;
  failCspButton: Element;
  // containers
  codeContainer: Element;
  tokensContainer: Element;
  cspErrorsContainer: Element;
  oidcErrorContainer: Element;

  bootstrap(rootElem: Element) {
    rootElem.innerHTML = LayoutTemplate;

    // set elements
    this.configEditor = document.getElementById('config-editor');
    this.configPreview = document.getElementById('config-preview');
    this.startButton = document.querySelector('#actions-container button[name="start"]');
    this.hideButton = document.querySelector('#actions-container button[name="hide"]');
    this.showButton = document.querySelector('#actions-container button[name="show"]');
    this.removeButton = document.querySelector('#actions-container button[name="remove"]');
    this.showSignInAndRedirectButton = document.querySelector('#actions-container button[name="showSignInAndRedirect"]');
    this.showSignInToGetTokensButton = document.querySelector('#actions-container button[name="showSignInToGetTokens"]');
    this.renderElButton = document.querySelector('#actions-container button[name="renderEl"]')
    this.failCspButton = document.querySelector('#actions-container button[name="fail-csp"]');
    this.tokensContainer = document.getElementById('tokens-container');
    this.codeContainer = document.getElementById('code-container');
    this.cspErrorsContainer = document.getElementById('csp-errors-container');
    this.oidcErrorContainer = document.getElementById('oidc-error-container');

    this.addEventListeners();

    if (window.location.pathname === '/done') {
      this.handleLoginCallback();
    }
  }

  addEventListeners() {
    // csp listener
    document.addEventListener('securitypolicyviolation', (err) => {
      this.cspErrors = [...this.cspErrors, err];
      this.cspErrors.forEach(err => {
        const errorEl = document.createElement('div');
        errorEl.innerHTML = `${err.blockedURI} blocked due to CSP rule ${err.violatedDirective} from ${err.originalPolicy}`;
        this.cspErrorsContainer.appendChild(errorEl);
      });
    });

    // config editor
    this.configEditor.addEventListener('input', (event: any) => {
      const { value } = event.target;
      this.configEditor.textContent = value;
      // set valid config to preview 
      try {
        const parsedConfig = JSON.parse(value);
        this.configPreview.innerHTML = JSON.stringify(parsedConfig, null, 2);
      } catch (e) {
        // do nothing, only render preview when config is ready as JSON format
      }
    });

    // actions
    this.startButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, function(res: any) {
        if (res.status === 'SUCCESS') {
          res.session.setCookieAndRedirect(config.baseUrl + '/app/UserHome');
        }
      });
    });
    this.hideButton.addEventListener('click', () => {
      this.oktaSignIn.hide();
    });
    this.showButton.addEventListener('click', () => {
      this.oktaSignIn.show();
    });
    this.removeButton.addEventListener('click', () => {
      this.oktaSignIn.remove();
      this.oktaSignIn = null;
    });
    this.showSignInAndRedirectButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.showSignInAndRedirect();
    });
    this.showSignInToGetTokensButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.showSignInToGetTokens().then((tokens: Tokens) => {
        this.setTokens(tokens);
        this.oktaSignIn.remove();
      });
    });
    this.renderElButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.renderEl(
        { el: '#okta-login-container' },
        (res: any) => {
          if (res.status !== 'SUCCESS') {
            return;
          }
          this.setTokens(res.tokens);
          this.oktaSignIn.remove();
        },
        (err: AuthSdkError) => {
          this.setOidcError(err);
        }
      );
      this.oktaSignIn.on('afterError', (context: any, error: any) => {
        console.log(context, error);
      });
    });
    this.failCspButton.addEventListener('click', () => {
      try {
        /* eslint-disable-next-line no-eval */
        eval('var cspTrigger = true;');
      } catch (e) {
        console.warn(e);
      }
    });
  }

  getConfig() {
    let config;
    try {
      config = JSON.parse(this.configPreview.innerHTML);
    } catch (err) {
      throw new Error('Config need to be set in config editor before rendering the widget');
    }
    return config;
  }

  setTokens(tokens: Tokens) {
    this.tokensContainer.innerHTML = JSON.stringify(tokens, null, 2);
  }

  setCode(code: string) {
    this.codeContainer.innerHTML = code;
  }

  setOidcError(err: AuthSdkError) {
    this.oidcErrorContainer.innerHTML = JSON.stringify(err);
  }

  handleLoginCallback() {
    let responseMode;
    if (window.location.search.indexOf('code') >= 0) {
      responseMode = 'query';
    } else if (window.location.hash.indexOf('code') >= 0) {
      responseMode = 'fragment';
    }
    const authClient = new OktaAuth({
      issuer: `${process.env.WIDGET_TEST_SERVER}/oauth2/default`,
      redirectUri: 'http://localhost:3000/done',
      pkce: false,
      responseMode: responseMode
    });

    if (authClient.token.isLoginRedirect()) {
      authClient.token.parseFromUrl()
        .then((res) => {
          this.setTokens(res.tokens);
          this.setCode(res.code);
        })
        .catch(function(err) {
          console.log(err);
        })
        .finally(() => {
          window.history.pushState({}, '', '/');
        });
    }
  }

}
