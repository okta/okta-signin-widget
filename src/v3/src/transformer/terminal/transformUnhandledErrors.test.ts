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

import { AuthApiError } from '@okta/okta-auth-js';
import { InfoboxElement, MessageTypeVariant, WidgetProps } from 'src/types';

import { transformUnhandledErrors } from './transformUnhandledErrors';

describe('Unhandled Error Transformer Tests', () => {
  let apiError: AuthApiError;
  let mockProps: WidgetProps;

  beforeEach(() => {
    mockProps = {};
    apiError = {
      name: '',
      message: '',
      errorSummary: '',
      errorCode: '',
    };
  });

  it('should add Infobox with unexpected error message when error is not provided', () => {
    const formBag = transformUnhandledErrors(mockProps);

    expect(formBag.uischema.elements.length).toBe(1);
    const el = formBag.uischema.elements[0] as InfoboxElement;
    expect(el.type).toBe('InfoBox');
    expect(el.options?.message).toBe('oform.error.unexpected');
    expect(el.options?.class).toBe(MessageTypeVariant.ERROR);
  });

  it('should add info box when response is invalid recovery token error', () => {
    const mockErrorMessage = 'The recovery token is invalid';
    apiError = {
      ...apiError,
      errorCode: 'invalid_request',
      errorSummary: mockErrorMessage,
    };
    const formBag = transformUnhandledErrors(mockProps, apiError);

    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('InfoBox');
    expect((formBag.uischema.elements[0] as InfoboxElement).options?.message).toBe('oie.invalid.recovery.token');
    expect((
      formBag.uischema.elements[0] as InfoboxElement
    ).options?.class).toBe(MessageTypeVariant.ERROR);
  });

  it('should add info box when oie is not enabled error', () => {
    const mockErrorMessage = 'Another mocked error message';
    apiError = {
      ...apiError,
      errorCode: 'access_denied',
      errorSummary: mockErrorMessage,
    };
    const formBag = transformUnhandledErrors(mockProps, apiError);

    expect(formBag.uischema.elements.length).toBe(1);
    const el = formBag.uischema.elements[0] as InfoboxElement;
    expect(el.type).toBe('InfoBox');
    expect(el.options?.message).toBe('oie.feature.disabled');
    expect(el.options?.class).toBe(MessageTypeVariant.ERROR);
  });

  it('should add info box when oie configuration error', () => {
    const mockErrorMessage = 'Yet another mocked error message';
    apiError = {
      ...apiError,
      errorCode: 'some_error_key',
      errorSummary: mockErrorMessage,
    };
    const formBag = transformUnhandledErrors(mockProps, apiError);

    expect(formBag.uischema.elements.length).toBe(1);
    const el = formBag.uischema.elements[0] as InfoboxElement;
    expect(el.type).toBe('InfoBox');
    expect(el.options?.message).toBe('oie.configuration.error');
    expect(el.options?.class).toBe(MessageTypeVariant.ERROR);
  });
});
