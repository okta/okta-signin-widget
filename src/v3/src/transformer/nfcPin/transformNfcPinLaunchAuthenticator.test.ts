/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import { IDX_STEP } from '../../constants';
import {
  DescriptionElement, LaunchAuthenticatorButtonElement, TitleElement, WidgetProps,
} from '../../types';
import { transformNfcPinLaunchAuthenticator } from './transformNfcPinLaunchAuthenticator';

describe('transformNfcPinLaunchAuthenticator', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps = {} as WidgetProps;

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.context = {
      ...transaction.context,
      app: { type: 'object', value: { label: '' } },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create title, description, and launch button elements', () => {
    const result = transformNfcPinLaunchAuthenticator({
      transaction, formBag, widgetProps,
    });

    expect(result.uischema.elements.length).toBe(3);
    expect((result.uischema.elements[0] as TitleElement).type).toBe('Title');
    expect((result.uischema.elements[1] as DescriptionElement).type).toBe('Description');
    expect((result.uischema.elements[2] as LaunchAuthenticatorButtonElement).type).toBe('LaunchAuthenticatorButton');
  });

  it('should use primaryauth.title as the title', () => {
    const result = transformNfcPinLaunchAuthenticator({
      transaction, formBag, widgetProps,
    });

    expect((result.uischema.elements[0] as TitleElement).options.content)
      .toBe('primaryauth.title');
  });

  it('should use NFC-specific button label', () => {
    const result = transformNfcPinLaunchAuthenticator({
      transaction, formBag, widgetProps,
    });

    const button = result.uischema.elements[2] as LaunchAuthenticatorButtonElement;
    expect(button.label).toBe('oie.nfc_pin.launch.button');
    expect(button.options.i18nKey).toBe('oie.nfc_pin.launch.button');
  });

  it('should use launch-nfc-authenticator as the step', () => {
    const result = transformNfcPinLaunchAuthenticator({
      transaction, formBag, widgetProps,
    });

    const button = result.uischema.elements[2] as LaunchAuthenticatorButtonElement;
    expect(button.options.step).toBe(IDX_STEP.LAUNCH_NFC_AUTHENTICATOR);
  });

  it('should show app-specific description when app label is provided', () => {
    transaction.context.app = { type: 'object', value: { label: 'Okta Dashboard' } };

    const result = transformNfcPinLaunchAuthenticator({
      transaction, formBag, widgetProps,
    });

    expect((result.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oktaVerify.appDescription');
  });

  it('should show generic description when no app label', () => {
    transaction.context.app = { type: 'object', value: { label: '' } };

    const result = transformNfcPinLaunchAuthenticator({
      transaction, formBag, widgetProps,
    });

    expect((result.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oktaVerify.description');
  });

  it('should pass deviceChallengeUrl from authenticatorChallenge', () => {
    // @ts-expect-error authenticatorChallenge not typed on context
    transaction.context.authenticatorChallenge = {
      value: {
        href: 'com-okta-authenticator:/deviceChallenge?challengeRequest=mock-jwt',
        challengeMethod: 'CUSTOM_URI',
      },
    };

    const result = transformNfcPinLaunchAuthenticator({
      transaction, formBag, widgetProps,
    });

    const button = result.uischema.elements[2] as LaunchAuthenticatorButtonElement;
    expect(button.options.deviceChallengeUrl)
      .toBe('com-okta-authenticator:/deviceChallenge?challengeRequest=mock-jwt');
    expect(button.options.challengeMethod).toBe('CUSTOM_URI');
  });
});
