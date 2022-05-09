/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import { pick } from 'lodash';
import { h, render } from 'preact';

import { version } from '../../package.json';
import { Widget } from '../components/Widget';
import { WidgetProps } from '../types/widget';

export type RenderOptions = {
  el: string;
  clientId?: string;
  redirectUri?: string;
  redirect?: 'always' | 'never';
  authParams?: OktaAuthOptions;
};

export type OktaWidgetEventHandler = {
  (...args: unknown[]): void;
};

export type RenderCallback = {
  (...args: unknown[]): void;
};

export default class OktaSignIn {
  /**
   * Version string
   */
  readonly version: string;

  /**
   * Okta Signin Widget options
   */
  readonly options: WidgetProps;

  /**
   * Instance of OktaAuth client
   */
  readonly authClient: OktaAuth;

  /**
   * Registered event handlers
   */
  readonly events: {
    [eventName: string]: OktaWidgetEventHandler
  };

  constructor(options: WidgetProps) {
    this.version = version;
    this.options = options;
    this.events = {};

    // if authClient is set, authParams are disregarded
    if (options.authClient) {
      // safety check
      if (!(options.authClient instanceof OktaAuth)) {
        throw new Error('expected "authClient" to be an instance of OktaAuth');
      }

      // instance of OktaAuth client
      this.authClient = options.authClient;
    } else {
      const authParams = {
        ...pick(options, [
          'issuer',
          'clientId',
          'redirectUri',
          'state',
          'scopes',
          'flow',
          'codeChallenge',
          'codeChallengeMethod',
          'recoveryToken',
        ]),
        ...options.authParams,
      };

      // set default issuer using baseUrl
      if (!authParams.issuer) {
        authParams.issuer = `${options.baseUrl}/oauth2/default`;
      }

      // instance of OktaAuth client
      this.authClient = new OktaAuth(authParams);

      // add widget version to extended user agent header
      // eslint-disable-next-line no-underscore-dangle
      const userAgent = this.authClient._oktaUserAgent;
      if (userAgent) {
        userAgent.addEnvironment(`okta-signin-widget-${version}`);
      }

      if (options.el) {
        this.renderEl({
          el: options.el,
          clientId: authParams.clientId,
          redirectUri: authParams.redirectUri,
        });
      }
    }
  }

  renderEl(
    options: RenderOptions,
    onSuccess?: RenderCallback,
    onError?: RenderCallback,
  ): Promise<{ tokens: Record<string, string> }> {
    const { el } = options;

    return new Promise<{ tokens: Record<string, string> }>((resolve, reject) => {
      try {
        const target = typeof el === 'string'
          ? document.querySelector(el)
          : el;

        if (target) {
          render(h(Widget, { ...this.options, authClient: this.authClient }), target);
          if (typeof onSuccess === 'function') {
            onSuccess({});
          }
          resolve({
            tokens: {
              idToken: 'idToken',
              accessToken: 'accessToken',
              refreshToken: 'refreshToken',
            },
          });
        } else {
          throw new Error(`could not find element ${el}`);
        }
      } catch (error) {
        if (typeof onError === 'function') {
          onError(error);
        }
        reject(error);
      }
    });
  }

  showSignInToGetTokens(options = {}): Promise<Record<string, unknown>> {
    if (this.authClient.isAuthorizationCodeFlow() && this.authClient.isPKCE()) {
      throw new Error('"showSignInToGetTokens()" should not be used for authorization_code flow. Use "showSignInAndRedirect()" instead');
    }

    return this.renderEl({
      ...this.buildRenderOptions(options),
      redirect: 'never',
    })
      .then((res) => res.tokens);
  }

  showSignInAndRedirect(options = {}): Promise<unknown> {
    return this.renderEl({
      ...this.buildRenderOptions(options),
      redirect: 'always',
    });
  }

  showSignIn(options = {}): Promise<unknown> {
    return this.renderEl(
      this.buildRenderOptions(options),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  before(): void {}

  // eslint-disable-next-line class-methods-use-this
  after(): void {}

  // eslint-disable-next-line class-methods-use-this
  hide(): void {}

  // eslint-disable-next-line class-methods-use-this
  show(): void {}

  // eslint-disable-next-line class-methods-use-this
  remove(): void {}

  // eslint-disable-next-line class-methods-use-this
  getUser(): void {}

  on(eventName: string, eventHandler: OktaWidgetEventHandler): void {
    this.events[eventName] = eventHandler;
  }

  private buildRenderOptions(
    options: WidgetProps & Record<string, string> = {},
  ): RenderOptions {
    const widgetOptions = this.options;
    const authParams: OktaAuthOptions = {
      ...widgetOptions.authParams,
      ...pick(options, [
        'responseType',
        'scopes',
        'state',
        'nonce',
        'idp',
        'idpScope',
        'display',
        'prompt',
        'maxAge',
        'loginHint',
      ]),
    };

    const { el, clientId, redirectUri } = { ...widgetOptions, ...options };
    if (!el) {
      throw new Error('"el" is required');
    }
    if (!clientId) {
      throw new Error('"clientId" is required');
    }
    if (!redirectUri) {
      throw new Error('"redirectUri" is required');
    }
    return {
      el,
      clientId,
      redirectUri,
      authParams,
    };
  }
}
