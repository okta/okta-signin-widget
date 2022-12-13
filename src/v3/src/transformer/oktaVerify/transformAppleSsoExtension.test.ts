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
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import {
  AutoSubmitElement,
  FormBag,
  RedirectElement,
  SpinnerElement,
  TitleElement,
  WidgetProps,
} from '../../types';
import { transformAppleSsoExtension } from './transformAppleSsoExtension';

describe('SSO extension Transformer Tests', () => {
  let widgetProps: WidgetProps;
  let formBag: FormBag;
  let transaction: IdxTransaction;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    widgetProps = {};
  });

  it('should create title and loading spinner elements for display', () => {
    const updatedFormBag = transformAppleSsoExtension({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).type)
      .toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('deviceTrust.sso.redirectText');
    expect((updatedFormBag.uischema.elements[1] as SpinnerElement).type)
      .toBe('Spinner');
  });

  it('should add Redirect element if step is device-apple-sso-extension and method is GET', () => {
    transaction.nextStep = {
      name: IDX_STEP.DEVICE_APPLE_SSO_EXTENSION,
    };
    transaction.neededToProceed = [
      {
        name: IDX_STEP.DEVICE_APPLE_SSO_EXTENSION,
        method: 'GET',
        href: 'localhost:3000',
      },
    ];
    const updatedFormBag = transformAppleSsoExtension({ transaction, formBag, widgetProps });
    expect((updatedFormBag.uischema.elements[2] as RedirectElement).type)
      .toBe('Redirect');
    expect((updatedFormBag.uischema.elements[2] as RedirectElement).options.url)
      .toBe('localhost:3000');
  });

  it('should add AutoSubmit element if step is device-apple-sso-extension and method is POST', () => {
    transaction.nextStep = {
      name: IDX_STEP.DEVICE_APPLE_SSO_EXTENSION,
    };
    transaction.neededToProceed = [
      {
        name: IDX_STEP.DEVICE_APPLE_SSO_EXTENSION,
        method: 'POST',
      },
    ];
    const updatedFormBag = transformAppleSsoExtension({ transaction, formBag, widgetProps });
    expect((updatedFormBag.uischema.elements[2] as AutoSubmitElement).type)
      .toBe('AutoSubmit');
    expect((updatedFormBag.uischema.elements[2] as AutoSubmitElement).options.step)
      .toBe(IDX_STEP.DEVICE_APPLE_SSO_EXTENSION);
  });
});
