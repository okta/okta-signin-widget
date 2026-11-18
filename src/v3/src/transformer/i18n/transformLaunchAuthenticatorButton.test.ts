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

import { IDX_STEP } from 'src/constants';
import { getStubFormBag } from 'src/mocks/utils/utils';
import { FormBag, LaunchAuthenticatorButtonElement } from 'src/types';

import { transformLaunchAuthenticatorButton } from './transformLaunchAuthenticatorButton';
import * as i18nUtil from './util';

describe('transformLaunchAuthenticatorButton', () => {
  let formBag: FormBag;

  const setButton = (options: LaunchAuthenticatorButtonElement['options']) => {
    formBag.uischema.elements = [{ type: 'LaunchAuthenticatorButton', options } as LaunchAuthenticatorButtonElement];
  };

  beforeEach(() => {
    formBag = getStubFormBag();
    jest.spyOn(i18nUtil, 'addTranslation');
  });

  it('should use the Okta Verify label when no i18nKey is set', () => {
    setButton({ step: IDX_STEP.LAUNCH_AUTHENTICATOR });

    transformLaunchAuthenticatorButton(formBag);

    expect(i18nUtil.addTranslation).toHaveBeenCalledWith(expect.objectContaining({
      name: 'label', i18nKey: 'oktaVerify.button', params: undefined,
    }));
  });

  it('should use the default NFC label', () => {
    setButton({ step: IDX_STEP.LAUNCH_NFC_AUTHENTICATOR, i18nKey: 'oie.nfc_pin.launch.button' });

    transformLaunchAuthenticatorButton(formBag);

    expect(i18nUtil.addTranslation).toHaveBeenCalledWith(expect.objectContaining({
      name: 'label', i18nKey: 'oie.nfc_pin.launch.button', params: undefined,
    }));
  });

  it('should pass i18nParams for the custom NFC label', () => {
    setButton({
      step: IDX_STEP.LAUNCH_NFC_AUTHENTICATOR,
      i18nKey: 'oie.nfc_pin.launch.button.custom',
      i18nParams: ['Badge'],
    });

    transformLaunchAuthenticatorButton(formBag);

    expect(i18nUtil.addTranslation).toHaveBeenCalledWith(expect.objectContaining({
      name: 'label', i18nKey: 'oie.nfc_pin.launch.button.custom', params: ['Badge'],
    }));
  });
});
