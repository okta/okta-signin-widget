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
import { transformButtons } from './transform';

jest.mock('./transformSubmitButton', () => ({
  transformSubmitButton: () => () => ({}),
}));
jest.mock('./transformIDPButtons', () => ({
  transformIDPButtons: () => () => ({}),
}));
jest.mock('./transformForgotPasswordButton', () => ({
  transformForgotPasswordButton: () => () => ({}),
}));
jest.mock('./transformUnlockAccountButton', () => ({
  transformUnlockAccountButton: () => () => ({}),
}));
jest.mock('./transformVerifyWithOtherButton', () => ({
  transformVerifyWithOtherButton: () => () => ({}),
}));
jest.mock('./transformReturnToAuthenticatorListButton', () => ({
  transformReturnToAuthenticatorListButton: () => () => ({}),
}));
jest.mock('./transformRegisterButton', () => ({
  transformRegisterButton: () => () => ({}),
}));
jest.mock('./transformCancelButton', () => ({
  transformCancelButton: () => () => ({}),
}));

/* eslint-disable global-require */
const mocked = {
  idps: require('./transformIDPButtons'),
  submit: require('./transformSubmitButton'),
  forgotPassword: require('./transformForgotPasswordButton'),
  unlockAccount: require('./transformUnlockAccountButton'),
  verifyWithOther: require('./transformVerifyWithOtherButton'),
  returnToAuthenticatorList: require('./transformReturnToAuthenticatorListButton'),
  register: require('./transformRegisterButton'),
  cancel: require('./transformCancelButton'),
};
/* eslint-enable global-require */

describe('Button Transformer Tests', () => {
  it('follows transformation steps', () => {
    jest.spyOn(mocked.idps, 'transformIDPButtons');
    jest.spyOn(mocked.submit, 'transformSubmitButton');
    jest.spyOn(mocked.forgotPassword, 'transformForgotPasswordButton');
    jest.spyOn(mocked.unlockAccount, 'transformUnlockAccountButton');
    jest.spyOn(mocked.verifyWithOther, 'transformVerifyWithOtherButton');
    jest.spyOn(mocked.returnToAuthenticatorList, 'transformReturnToAuthenticatorListButton');
    jest.spyOn(mocked.register, 'transformRegisterButton');
    jest.spyOn(mocked.cancel, 'transformCancelButton');

    const formBag = getStubFormBag();
    const mockOptions = {
      transaction: {},
      widgetProps: {},
    } as TransformationOptions;
    transformButtons(mockOptions)(formBag);

    expect(mocked.idps.transformIDPButtons)
      .toHaveBeenCalledBefore(mocked.submit.transformSubmitButton);

    expect(mocked.idps.transformIDPButtons).toHaveBeenCalled();
    expect(mocked.submit.transformSubmitButton).toHaveBeenCalled();
    expect(mocked.forgotPassword.transformForgotPasswordButton).toHaveBeenCalled();
    expect(mocked.unlockAccount.transformUnlockAccountButton).toHaveBeenCalled();
    expect(mocked.verifyWithOther.transformVerifyWithOtherButton).toHaveBeenCalled();
    expect(mocked.returnToAuthenticatorList.transformReturnToAuthenticatorListButton)
      .toHaveBeenCalled();
    expect(mocked.register.transformRegisterButton).toHaveBeenCalled();
    expect(mocked.cancel.transformCancelButton).toHaveBeenCalled();
  });
});
