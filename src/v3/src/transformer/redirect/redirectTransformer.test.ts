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

import { IdxTransaction } from '@okta/okta-auth-js';
import { InterstitialRedirectView } from 'src/constants';
import { getStubTransaction } from 'src/mocks/utils/utils';
import {
  DescriptionElement, RedirectElement,
  SpinnerElement, WidgetProps,
} from 'src/types';

import { redirectTransformer } from '.';

describe('Success Redirect Transform Tests', () => {
  const REDIRECT_URL = 'https://acme.okta1.com';
  let transaction: IdxTransaction;
  let mockProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransaction();
    mockProps = {};
  });

  it('should add description & redirect elements only when interstitialRedirect option is not set', () => {
    const formBag = redirectTransformer(transaction, REDIRECT_URL, mockProps);

    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('Description');
    expect((formBag.uischema.elements[0] as DescriptionElement).options?.content)
      .toBe('oie.success.text.signingIn.with.ellipsis');
    expect(formBag.uischema.elements[1].type).toBe('Redirect');
    expect((formBag.uischema.elements[1] as RedirectElement).options?.url).toBe(REDIRECT_URL);
  });

  it('should add description & redirect elements only when interstitialRedirect option is set to NONE', () => {
    mockProps = { interstitialBeforeLoginRedirect: InterstitialRedirectView.NONE };
    const formBag = redirectTransformer(transaction, REDIRECT_URL, mockProps);

    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('Description');
    expect((formBag.uischema.elements[0] as DescriptionElement).options?.content)
      .toBe('oie.success.text.signingIn.with.ellipsis');
    expect(formBag.uischema.elements[1].type).toBe('Redirect');
    expect((formBag.uischema.elements[1] as RedirectElement).options?.url).toBe(REDIRECT_URL);
  });

  it('should add app name and identifier to description element for DEFAULT Interstitial view '
    + 'when app name, identifier exists in transaction and showIdentifier option is false', () => {
    const appInfo = { name: 'Okta Dashboard' };
    const userInfo = { identifier: 'testuser@okta.com' };
    transaction.context.app.value = appInfo;
    transaction.context.user = { type: 'object', value: userInfo };
    mockProps = {
      interstitialBeforeLoginRedirect: InterstitialRedirectView.DEFAULT,
      features: { showIdentifier: false },
    };
    const formBag = redirectTransformer(
      transaction,
      REDIRECT_URL,
      mockProps,
    );

    expect(formBag.uischema.elements.length).toBe(3);
    expect(formBag.uischema.elements[0].type).toBe('Description');
    expect((formBag.uischema.elements[0] as DescriptionElement).options?.content)
      .toBe('oie.success.text.signingIn.with.appName.and.identifier');
    expect(formBag.uischema.elements[1].type).toBe('Redirect');
    expect((formBag.uischema.elements[1] as RedirectElement).options?.url).toBe(REDIRECT_URL);
    expect(formBag.uischema.elements[2].type).toBe('Spinner');
    expect((formBag.uischema.elements[2] as SpinnerElement).options?.label).toBe('Loading...');
    expect((formBag.uischema.elements[2] as SpinnerElement).options?.valueText).toBe('Loading...');
  });

  it('should add generic description & redirect elements for DEFAULT Interstitial view '
    + 'when showIdentifier option is true and appInfo does not exist in transaction', () => {
    const userInfo = { identifier: 'testuser@okta.com' };
    transaction.context.user = { type: 'object', value: userInfo };
    mockProps = {
      interstitialBeforeLoginRedirect: InterstitialRedirectView.DEFAULT,
      features: { showIdentifier: true },
    };
    const formBag = redirectTransformer(
      transaction,
      REDIRECT_URL,
      mockProps,
    );

    expect(formBag.uischema.elements.length).toBe(3);
    expect(formBag.uischema.elements[0].type).toBe('Description');
    expect((formBag.uischema.elements[0] as DescriptionElement).options?.content)
      .toBe('oie.success.text.signingIn');
    expect(formBag.uischema.elements[1].type).toBe('Redirect');
    expect((formBag.uischema.elements[1] as RedirectElement).options?.url).toBe(REDIRECT_URL);
    expect(formBag.uischema.elements[2].type).toBe('Spinner');
    expect((formBag.uischema.elements[2] as SpinnerElement).options?.label).toBe('Loading...');
    expect((formBag.uischema.elements[2] as SpinnerElement).options?.valueText).toBe('Loading...');
  });

  it('should add app name to description element for DEFAULT Interstitial view '
    + 'when identifier is missing from transaction', () => {
    const appInfo = { name: 'Okta Dashboard' };
    transaction.context.app.value = appInfo;
    mockProps = { interstitialBeforeLoginRedirect: InterstitialRedirectView.DEFAULT };
    const formBag = redirectTransformer(
      transaction,
      REDIRECT_URL,
      mockProps,
    );

    expect(formBag.uischema.elements.length).toBe(3);
    expect(formBag.uischema.elements[0].type).toBe('Description');
    expect((formBag.uischema.elements[0] as DescriptionElement).options?.content)
      .toBe('oie.success.text.signingIn.with.appName');
    expect(formBag.uischema.elements[1].type).toBe('Redirect');
    expect((formBag.uischema.elements[1] as RedirectElement).options?.url).toBe(REDIRECT_URL);
    expect(formBag.uischema.elements[2].type).toBe('Spinner');
    expect((formBag.uischema.elements[2] as SpinnerElement).options?.label).toBe('Loading...');
    expect((formBag.uischema.elements[2] as SpinnerElement).options?.valueText)
      .toBe('Loading...');
  });
});
