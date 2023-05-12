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
import pick from 'lodash/pick';
import { h, render } from 'preact';

import { Widget } from '../components/Widget';
import { JsonObject } from '../types';
import {
  OktaWidgetEventHandler,
  OktaWidgetEventType,
  RenderOptions,
  WidgetProps,
} from '../types/widget';

// TODO: Once SIW is merged into okta-signin-widget repo, remove these.
export type RenderSuccessCallback = {
  (res: JsonObject): void;
};
export type RenderErrorCallback = {
  (args: Error): void;
};
// TODO: Once SIW is merged into okta-signin-widget repo, remove these
export type RenderResult = JsonObject;
export type Tokens = JsonObject;

console.debug(`${OKTA_SIW_VERSION}-g${OKTA_SIW_COMMIT_HASH.substring(0, 7)}`);

export default class OktaSignIn {
  /**
   * Version string
   */
  readonly version: string;

  /**
   * Package version
   */
  static readonly __version: string = OKTA_SIW_VERSION;

  /**
   * Commit SHA
   */
  static readonly __commit: string = OKTA_SIW_COMMIT_HASH;

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
    [key in OktaWidgetEventType]: OktaWidgetEventHandler
  } | Record<string, never>;

  el: string | null;

  constructor(options: WidgetProps) {
    this.version = OKTA_SIW_VERSION;
    this.options = options;
    this.el = null;

    this.events = {};

    // if authClient is set, authParams are disregarded
    if (options.authClient) {
      // safety check
      if (!(options.authClient instanceof OktaAuth)) {
        throw new Error('expected "authClient" to be an instance of OktaAuth');
      }

      // instance of OktaAuth client
      this.authClient = options.authClient;
      // HACK: options should not be touched once instance is initialized
      // Update auth-js to preserve useGenericRemediator when passed from function level
      this.authClient.options.idx = this.authClient.options.idx || {};
      this.authClient.options.idx.useGenericRemediator = true;
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
        idx: {
          useGenericRemediator: true,
        },
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
        userAgent.addEnvironment('okta-signin-widget-next');
        userAgent.addEnvironment(OKTA_SIW_COMMIT_HASH);
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
    onSuccess?: RenderSuccessCallback,
    onError?: RenderErrorCallback,
  ): Promise<RenderResult> {
    const { el } = options;
    this.el = el;

    return new Promise<RenderResult>((resolve, reject) => {
      const onSuccessWrapper = (data: JsonObject): void => {
        onSuccess?.(data);
        resolve(data);
      };
      const onErrorWrapper = (err: Error): void => {
        onError?.(err);
        reject(err);
      };
      try {
        const target = typeof this.el === 'string'
          ? document.querySelector(this.el)
          : this.el;

        if (target) {
          // @ts-ignore OKTA-508744
          render(h(Widget, {
            // @ts-expect-error
            events: this.events,
            authClient: this.authClient,
            globalSuccessFn: onSuccessWrapper,
            globalErrorFn: onErrorWrapper,
            ...this.options,
          }), target);
        } else {
          throw new Error(`could not find element ${el}`);
        }
      } catch (error) {
        if (typeof onError === 'function') {
          onErrorWrapper(error as Error);
        }
        reject(error);
      }
    });
  }

  showSignInToGetTokens(options = {}): Promise<Tokens> {
    if (this.authClient.isAuthorizationCodeFlow() && this.authClient.isPKCE()) {
      throw new Error('"showSignInToGetTokens()" should not be used for authorization_code flow. Use "showSignInAndRedirect()" instead');
    }

    return this.renderEl({
      ...this.buildRenderOptions(options),
      redirect: 'never',
    })
      .then((res) => res.tokens as JsonObject); // Remove this cast once merged into okta-signin-widget
  }

  showSignInAndRedirect(options = {}): Promise<void> {
    // This method should never return, it will either redirect or reject with error
    return this.renderEl({
      ...this.buildRenderOptions(options),
      redirect: 'always',
    })
      .then(() => { });
  }

  showSignIn(options = {}): Promise<RenderResult> {
    return this.renderEl(
      this.buildRenderOptions(options),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  before(): void { }

  // eslint-disable-next-line class-methods-use-this
  after(): void { }

  // eslint-disable-next-line class-methods-use-this
  hide(): void { }

  // eslint-disable-next-line class-methods-use-this
  show(): void { }

  remove(): void {
    const target = typeof this.el === 'string'
      ? document.querySelector(this.el)
      : this.el;

    if (target) {
      render(null, target);

      this.el = null;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getUser(): void { }

  on(eventName: OktaWidgetEventType, eventHandler: OktaWidgetEventHandler): void {
    this.events[eventName] = eventHandler;
  }

  // eslint-disable-next-line class-methods-use-this
  off(): void { }

  private buildRenderOptions(
    options: WidgetProps & Record<string, string> = {},
  ): RenderOptions {
    const widgetOptions = this.options;
    // @ts-ignore OKTA-508744
    const authParams: OktaAuthOptions = {
      ...widgetOptions.authParams,
      ...{
        responseType: options.responseType,
        scopes: options.scopes,
        state: options.state,
        nonce: options.nonce,
        idp: options.idp,
        idpScope: options.idpScope,
        display: options.display,
        prompt: options.prompt,
        maxAge: options.maxAge,
        loginHint: options.loginHint,
      },
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
