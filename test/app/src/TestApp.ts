import { AuthSdkError, OktaAuth, TokenResponse, Tokens } from '@okta/okta-auth-js';
import OktaSignIn, { RenderResult, RenderResultSuccess } from '@okta/okta-signin-widget';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import getOktaSignIn from './getOktaSignIn';
import ConfigArea, { ConfigTemplate } from './configArea';
import {
  getBaseUrl,
  getConfigFromStorage,
  getDefaultConfig
} from './config';
import { Config } from './types';


const ActionsTemplate = `
  <div id="actions-container" class="pure-menu">
    <ul class="pure-menu-list">
      <li class="pure-menu-item">
        <button name="showSignIn" class="pure-menu-link">
          showSignIn
        </button>
      </li>
      <li class="pure-menu-item">
        <button name="showSignInAndRedirect" class="pure-menu-link">
          showSignInAndRedirect
        </button>
      </li>
      <li class="pure-menu-item">
        <button name="showSignInToGetTokens" class="pure-menu-link">
          showSignInToGetTokens
        </button>
      </li>
      <li class="pure-menu-item">
        <button name="renderEl" class="pure-menu-link">
          renderEl
        </button>
      </li>
      <li class="pure-menu-item">
        <button name="start" class="pure-menu-link">Start</button>
      </li>
      <li class="pure-menu-item">
        <button name="hide" class="pure-menu-link">Hide</button>
      </li>
      <li class="pure-menu-item">
        <button name="show" class="pure-menu-link">Show</button>
      </li>
      <li class="pure-menu-item">
        <button name="remove" class="pure-menu-link">Remove</button>
      </li>
      <li class="pure-menu-item">
        <button name="fail-csp" class="pure-menu-link">
          Trigger CSP Fail
        </button>
      </li>
      <li class="pure-menu-item visible-on-callback">
        <button name="clearTransaction" class="pure-menu-link">clear transaction storage</button>
      </li>
      <li class="pure-menu-item visible-on-callback">
        <button name="signOut" class="pure-menu-link">signOut</button>
      </li>
    </ul>
  </div>
`;

const TokensTemplate = `
  <pre id="tokens-container"></pre>
`;

const CodeTemplate = `
  <div id="code-container"></div>
`;


const ErrorsTemplate = `
  <div id="errors-container"></div>
`;

const CSPErrorsTemplate = `
  <div id="csp-errors-container"></div>
`;

const OIDCErrorTemplate = `
  <div id="oidc-error-container"></div>
`;

const CallbackTemplate = `
  <div id="callback-container">
    <div class="header">
      <strong>OAuth Callback Page</strong>
      <div id="callback-controls">
        <a href="/">Return Home</a>
      </div>
    </div>
  </div>
`;

const LayoutTemplate = `
  <div id="layout">
    <div class="flex-row">
      ${ActionsTemplate}
      <div id="main-column">
        ${CallbackTemplate}
        <div id="okta-login-container">
          <!-- widget renders here -->
        </div>
        ${TokensTemplate}
        ${CodeTemplate}
        ${ErrorsTemplate}
        ${CSPErrorsTemplate}
        ${OIDCErrorTemplate}
      </div>
      <div class="right-column">
        ${ConfigTemplate}
      </div>
    </div>
  </div>
`;

export default class TestApp {
  authClient: OktaAuth;
  oktaSignIn: OktaSignIn;
  errors: Error[] = [];
  cspErrors: SecurityPolicyViolationEvent[] = [];
  
  // config
  configArea: ConfigArea;
  configEditor: HTMLElement;
  configPreview: HTMLElement;
  // action buttons
  startButton: HTMLElement;
  hideButton: HTMLElement;
  showButton: HTMLElement;
  removeButton: HTMLElement;
  showSignInButton: HTMLElement;
  showSignInAndRedirectButton: HTMLElement;
  showSignInToGetTokensButton: HTMLElement;
  renderElButton: HTMLElement;
  failCspButton: HTMLElement;
  signOutButton: HTMLElement;
  clearTransaction: HTMLElement;

  // containers
  configContainer: HTMLElement;
  callbackContainer: HTMLElement;
  codeContainer: HTMLElement;
  tokensContainer: HTMLElement;
  errorsContainer: HTMLElement;
  cspErrorsContainer: HTMLElement;
  oidcErrorContainer: HTMLElement;

  bootstrap(rootElem: Element): void {
    rootElem.innerHTML = LayoutTemplate;

    // set elements
    this.callbackContainer = document.getElementById('callback-container');
    this.configContainer = document.getElementById('config-container');
    this.configEditor = document.getElementById('config-editor');
    this.configPreview = document.getElementById('config-preview');
    this.startButton = document.querySelector('#actions-container button[name="start"]');
    this.hideButton = document.querySelector('#actions-container button[name="hide"]');
    this.showButton = document.querySelector('#actions-container button[name="show"]');
    this.removeButton = document.querySelector('#actions-container button[name="remove"]');
    this.showSignInButton = document.querySelector('#actions-container button[name="showSignIn"]');
    this.showSignInAndRedirectButton = document.querySelector('#actions-container button[name="showSignInAndRedirect"]');
    this.showSignInToGetTokensButton = document.querySelector('#actions-container button[name="showSignInToGetTokens"]');
    this.renderElButton = document.querySelector('#actions-container button[name="renderEl"]')
    this.failCspButton = document.querySelector('#actions-container button[name="fail-csp"]');
    this.clearTransaction = document.querySelector('#actions-container button[name="clearTransaction"]');
    this.signOutButton = document.querySelector('#actions-container button[name="signOut"]');
    this.tokensContainer = document.getElementById('tokens-container');
    this.codeContainer = document.getElementById('code-container');
    this.errorsContainer = document.getElementById('errors-container');
    this.cspErrorsContainer = document.getElementById('csp-errors-container');
    this.oidcErrorContainer = document.getElementById('oidc-error-container');

    this.callbackContainer.style.display = 'none';

    this.addEventListeners();

    if (window.location.pathname === '/done') {
      this.handleLoginCallback();
      return;
    }

    this.configArea = new ConfigArea();
    this.configArea.bootstrap();
  }

  renderError(err?: Error): void {
    if (err) {
      console.error(err);
      this.errors.push(err);
    }
    this.errors.forEach(err => {
      const errorEl = document.createElement('div');
      const message = err.message || err.toString();
      errorEl.innerHTML = `${message}`;
      this.errorsContainer.appendChild(errorEl);
    });
  }

  addEventListeners(): void {
    // csp listener
    document.addEventListener('securitypolicyviolation', (err) => {
      this.cspErrors = [...this.cspErrors, err];
      this.cspErrors.forEach(err => {
        const errorEl = document.createElement('div');
        errorEl.innerHTML = `${err.blockedURI} blocked due to CSP rule ${err.violatedDirective} from ${err.originalPolicy}`;
        this.cspErrorsContainer.appendChild(errorEl);
      });
    });

    // actions
    this.startButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, (res: RenderResult) => {
        if (res.status === 'SUCCESS') {
          if (res.tokens) {
            this.setTokens(res.tokens);
            this.oktaSignIn.remove();
          } else if (res.session) {
            const baseUrl = getBaseUrl(config);
            res.session.setCookieAndRedirect(baseUrl + '/app/UserHome');
          }
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
    this.showSignInButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.showSignIn({ el: '#okta-login-container' }).then((res: RenderResultSuccess) => {
        if (res.tokens) {
          this.setTokens(res.tokens);
          this.oktaSignIn.remove();
        }
      });
    });
    this.showSignInAndRedirectButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.showSignInAndRedirect({ el: '#okta-login-container' });
    });
    this.showSignInToGetTokensButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.showSignInToGetTokens({ el: '#okta-login-container' }).then((tokens: Tokens) => {
        this.setTokens(tokens);
        this.oktaSignIn.remove();
      });
    });
    this.renderElButton.addEventListener('click', async () => {
      const config = this.getConfig();
      this.oktaSignIn = await getOktaSignIn(config);
      this.oktaSignIn.renderEl(
        { el: '#okta-login-container' },
        (res: RenderResult) => {
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
      this.oktaSignIn.on('afterError', (context: never, error: Error) => {
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
    this.clearTransaction.addEventListener('click', async () => {
      if (!this.oktaSignIn) {
        const config = this.getConfig();
        this.oktaSignIn = await getOktaSignIn(config);
      }
      this.oktaSignIn.authClient.transactionManager.clear();
    });
    this.signOutButton.addEventListener('click', async () => {
      if (!this.oktaSignIn) {
        const config = this.getConfig();
        this.oktaSignIn = await getOktaSignIn(config);
      }
      this.oktaSignIn.authClient.signOut();
    });
  }

  getConfig(): Config {
    let config;
    try {
      config = JSON.parse(this.configPreview.innerHTML);
    } catch (err) {
      throw new Error('Config need to be set in config editor before rendering the widget');
    }
    return config;
  }

  setTokens(tokens: Tokens): void {
    this.tokensContainer.innerHTML = JSON.stringify(tokens, null, 2);
  }

  setCode(code: string): void {
    this.codeContainer.innerHTML = code;
  }

  setOidcError(err: AuthSdkError): void {
    this.oidcErrorContainer.innerHTML = JSON.stringify(err);
  }

  async handleLoginCallback(): Promise<void> {
    this.callbackContainer.style.display = 'block';
    this.configContainer.style.display = 'none';
    document.querySelectorAll('#actions-container .pure-menu-item:not(.visible-on-callback').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    const config = getConfigFromStorage() || getDefaultConfig();

    // auto-detect responseMode
    let responseMode;
    if (window.location.search.indexOf('code') >= 0) {
      responseMode = 'query';
    } else if (window.location.hash.indexOf('code') >= 0) {
      responseMode = 'fragment';
    }
    if (responseMode) {
      config.authParams = config.authParams || {};
      config.authParams.responseMode = responseMode;
    }

    // get authClient
    const oktaSign = getOktaSignIn(config);
    const authClient = oktaSign.authClient;

    // email verify callback
    if (authClient.idx.isEmailVerifyCallback(window.location.search)) {
      const { state, otp } = authClient.idx.parseEmailVerifyCallback(window.location.search);
      this.oktaSignIn = await getOktaSignIn({ ...config, state, otp });
      this.oktaSignIn.showSignIn({ el: '#okta-login-container' }).then((res: RenderResultSuccess) => {
        if (res.tokens) {
          this.setTokens(res.tokens);
          this.oktaSignIn.remove();
        }
      });
      return;
    }

    // handle redirect
    if (authClient.token.isLoginRedirect()) {
      let promise;
      if (/(interaction_code=)/i.test(window.location.search)) {
        promise = authClient.idx.handleInteractionCodeRedirect(window.location.href)
          .then(() => {
            const tokens = authClient.tokenManager.getTokensSync();
            this.setTokens(tokens);
          })
      } else {
        promise = authClient.token.parseFromUrl()
          .then((res: TokenResponse) => {
            this.setTokens(res.tokens);
            this.setCode(res.code);
          });
      }
      
      promise
        .catch((err: Error) => {
          this.renderError(err);
        });
    }
  }

}
