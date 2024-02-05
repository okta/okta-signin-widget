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

import { AuthApiError, OAuthError } from '@okta/okta-auth-js';
import { InfoboxElement, WidgetProps } from 'src/types';

import { transformUnhandledErrors } from './transformUnhandledErrors';

describe('Unhandled Error Transformer Tests', () => {
  describe('When AuthApiError is returned', () => {
    let apiError: AuthApiError;
    let widgetProps: WidgetProps;

    beforeEach(() => {
      widgetProps = {};
      apiError = {
        name: 'AuthApiError',
        message: '',
        errorSummary: '',
        errorCode: '',
      };
    });

    it('should add Infobox with unexpected error message when error is not provided', () => {
      const formBag = transformUnhandledErrors(widgetProps);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(1);
      const el = formBag.uischema.elements[0] as InfoboxElement;
      expect(el.type).toBe('InfoBox');
      expect(el.options?.message).toEqual({
        class: 'ERROR',
        i18n: { key: 'oform.error.unexpected' },
        message: 'oform.error.unexpected',
      });
      expect(el.options?.class).toBe('ERROR');
    });

    it('should add infobox with custom message from server', () => {
      const mockErrorMessage = 'Custom error message';
      apiError = {
        ...apiError,
        errorCode: 'some_error_key',
        errorSummary: mockErrorMessage,
      };
      const formBag = transformUnhandledErrors(widgetProps, apiError);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(1);
      const el = formBag.uischema.elements[0] as InfoboxElement;
      expect(el.type).toBe('InfoBox');
      expect(el.options?.message).toEqual({
        class: 'ERROR',
        message: 'Custom error message',
      });
      expect(el.options?.class).toBe('ERROR');
    });
  });

  describe('When OAuthError is returned', () => {
    let apiError: OAuthError;
    let widgetProps: WidgetProps;

    beforeEach(() => {
      widgetProps = {};
      apiError = {
        name: 'OAuthError',
        message: '',
        errorCode: '',
        errorSummary: '',
        error: '',
        error_description: '',
      };
    });

    it('should add Infobox with unexpected error message when error is not provided', () => {
      const formBag = transformUnhandledErrors(widgetProps);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(1);
      const el = formBag.uischema.elements[0] as InfoboxElement;
      expect(el.type).toBe('InfoBox');
      expect(el.options?.message).toEqual({
        class: 'ERROR',
        i18n: { key: 'oform.error.unexpected' },
        message: 'oform.error.unexpected',
      });
      expect(el.options?.class).toBe('ERROR');
    });

    it('should add info box when response is invalid recovery token error', () => {
      const mockErrorMessage = 'The recovery token is invalid';
      apiError = {
        ...apiError,
        error: 'invalid_request',
        error_description: mockErrorMessage,
      };
      const formBag = transformUnhandledErrors(widgetProps, apiError);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(1);
      expect(formBag.uischema.elements[0].type).toBe('InfoBox');
      expect((formBag.uischema.elements[0] as InfoboxElement).options?.message)
        .toEqual({
          class: 'ERROR',
          i18n: { key: 'oie.invalid.recovery.token' },
          message: 'oie.invalid.recovery.token',
        });
      expect((
        formBag.uischema.elements[0] as InfoboxElement
      ).options?.class).toBe('ERROR');
    });

    it('should add info box when response is invalid activation token error', () => {
      const mockErrorMessage = 'The activation token is invalid';
      apiError = {
        ...apiError,
        error: 'invalid_request',
        error_description: mockErrorMessage,
      };
      const formBag = transformUnhandledErrors(widgetProps, apiError);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(1);
      expect(formBag.uischema.elements[0].type).toBe('InfoBox');
      expect((formBag.uischema.elements[0] as InfoboxElement).options?.message)
        .toEqual({
          class: 'ERROR',
          i18n: { key: 'idx.missing.activation.token' },
          message: 'idx.missing.activation.token',
          title: 'oie.activation.request.email.title.invalid',
        });
      expect((
        formBag.uischema.elements[0] as InfoboxElement
      ).options?.class).toBe('ERROR');
    });

    it('should add info box when oie is not enabled error', () => {
      const mockErrorMessage = 'A mocked error message';
      apiError = {
        ...apiError,
        error: 'access_denied',
        error_description: mockErrorMessage,
      };
      const formBag = transformUnhandledErrors(widgetProps, apiError);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(1);
      const el = formBag.uischema.elements[0] as InfoboxElement;
      expect(el.type).toBe('InfoBox');
      expect(el.options?.message).toEqual({
        class: 'ERROR',
        i18n: { key: 'oie.feature.disabled' },
        message: 'oie.feature.disabled',
      });
      expect(el.options?.class).toBe('ERROR');
    });

    it('should add info box when oie configuration error', () => {
      apiError = {
        ...apiError,
        error: 'unauthorized_client',
        error_description: 'The client is not authorized to use the provided grant type. Configured grant types: [refresh_token, implicit, authorization_code].',
      };
      const formBag = transformUnhandledErrors(widgetProps, apiError);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(1);
      const el = formBag.uischema.elements[0] as InfoboxElement;
      expect(el.type).toBe('InfoBox');
      expect(el.options?.message).toEqual({
        class: 'ERROR',
        i18n: { key: 'oie.configuration.error' },
        message: 'oie.configuration.error',
      });
      expect(el.options?.class).toBe('ERROR');
    });
  });
});
