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

import { getStubFormBag } from 'src/mocks/utils/utils';

import { TransformationOptions } from '../../types';
import { transformI18n } from './transform';

jest.mock('./transformField', () => ({
  transformField: () => () => ({}),
}));
jest.mock('./transformGranularConsentFields', () => ({
  transformGranularConsentFields: () => () => ({}),
}));
jest.mock('./transformAuthenticatorButton', () => ({
  transformAuthenticatorButton: () => () => ({}),
}));
jest.mock('./transformInputPassword', () => ({
  transformInputPassword: () => ({}),
}));
jest.mock('./transformPhoneAuthenticator', () => ({
  transformPhoneAuthenticator: () => ({}),
}));
jest.mock('./transformQRCode', () => ({
  transformQRCode: () => ({}),
}));
jest.mock('./transformIdentifierHint', () => ({
  transformIdentifierHint: () => () => ({}),
}));
jest.mock('./transformSecondEmailInputExplain', () => ({
  transformSecondEmailInputExplain: () => () => ({}),
}));
jest.mock('./transformPasscodeHint', () => ({
  transformPasscodeHint: () => () => ({}),
}));
jest.mock('./transformWebAuthNSubmitButton', () => ({
  transformWebAuthNSubmitButton: () => () => ({}),
}));
jest.mock('./transformPasswordMatches', () => ({
  transformPasswordMatches: () => () => ({}),
}));
jest.mock('./transformLaunchAuthenticatorButton', () => ({
  transformLaunchAuthenticatorButton: () => () => ({}),
}));
jest.mock('./transformOpenOktaVerifyFPButton', () => ({
  transformOpenOktaVerifyFPButton: () => () => ({}),
}));
jest.mock('./transformDefaultSelectOptionLabel', () => ({
  transformDefaultSelectOptionLabel: () => ({}),
}));

/* eslint-disable global-require */
const mocked = {
  field: require('./transformField'),
  granularConsentField: require('./transformGranularConsentFields'),
  button: require('./transformAuthenticatorButton'),
  inputPassword: require('./transformInputPassword'),
  phoneAuthenticator: require('./transformPhoneAuthenticator'),
  qrCode: require('./transformQRCode'),
  identifierHint: require('./transformIdentifierHint'),
  secondEmailExplain: require('./transformSecondEmailInputExplain'),
  passcodeHint: require('./transformPasscodeHint'),
  webAuthN: require('./transformWebAuthNSubmitButton'),
  passwordMatches: require('./transformPasswordMatches'),
  launchAuthenticator: require('./transformLaunchAuthenticatorButton'),
  openOktaVerifyFP: require('./transformOpenOktaVerifyFPButton'),
  defaultSelectOptionLabel: require('./transformDefaultSelectOptionLabel'),
};
/* eslint-enable global-require */

describe('i18n Transformer Tests', () => {
  it('follows transformation steps', () => {
    jest.spyOn(mocked.field, 'transformField');
    jest.spyOn(mocked.granularConsentField, 'transformGranularConsentFields');
    jest.spyOn(mocked.button, 'transformAuthenticatorButton');
    jest.spyOn(mocked.inputPassword, 'transformInputPassword');
    jest.spyOn(mocked.phoneAuthenticator, 'transformPhoneAuthenticator');
    jest.spyOn(mocked.qrCode, 'transformQRCode');
    jest.spyOn(mocked.identifierHint, 'transformIdentifierHint');
    jest.spyOn(mocked.secondEmailExplain, 'transformSecondEmailInputExplain');
    jest.spyOn(mocked.passcodeHint, 'transformPasscodeHint');
    jest.spyOn(mocked.webAuthN, 'transformWebAuthNSubmitButton');
    jest.spyOn(mocked.passwordMatches, 'transformPasswordMatches');
    jest.spyOn(mocked.launchAuthenticator, 'transformLaunchAuthenticatorButton');
    jest.spyOn(mocked.openOktaVerifyFP, 'transformOpenOktaVerifyFPButton');
    jest.spyOn(mocked.defaultSelectOptionLabel, 'transformDefaultSelectOptionLabel');

    const formBag = getStubFormBag();
    const mockOptions = {
      transaction: {},
      widgetProps: {},
    } as TransformationOptions;
    transformI18n(mockOptions)(formBag);

    expect(mocked.field.transformField)
      .toHaveBeenCalledBefore(mocked.identifierHint.transformIdentifierHint);

    expect(mocked.field.transformField).toHaveBeenCalled();
    expect(mocked.granularConsentField.transformGranularConsentFields).toHaveBeenCalled();
    expect(mocked.button.transformAuthenticatorButton).toHaveBeenCalled();
    expect(mocked.inputPassword.transformInputPassword).toHaveBeenCalled();
    expect(mocked.phoneAuthenticator.transformPhoneAuthenticator).toHaveBeenCalled();
    expect(mocked.qrCode.transformQRCode).toHaveBeenCalled();
    expect(mocked.identifierHint.transformIdentifierHint).toHaveBeenCalled();
    expect(mocked.secondEmailExplain.transformSecondEmailInputExplain).toHaveBeenCalled();
    expect(mocked.passcodeHint.transformPasscodeHint).toHaveBeenCalled();
    expect(mocked.webAuthN.transformWebAuthNSubmitButton).toHaveBeenCalled();
    expect(mocked.passwordMatches.transformPasswordMatches).toHaveBeenCalled();
    expect(mocked.launchAuthenticator.transformLaunchAuthenticatorButton).toHaveBeenCalled();
    expect(mocked.openOktaVerifyFP.transformOpenOktaVerifyFPButton).toHaveBeenCalled();
    expect(mocked.defaultSelectOptionLabel.transformDefaultSelectOptionLabel).toHaveBeenCalled();
  });
});
