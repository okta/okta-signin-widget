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

import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  LinkElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformReEnrollCustomPasswordExpiryWarning } from './transformReEnrollCustomPasswordExpiryWarning';

describe('ReEnroll Custom password expiry warning Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.nextStep = {
      ...transaction.nextStep,
      // @ts-expect-error OKTA-598703 - customExpiredPasswordName does not exist in NextStep type
      customExpiredPasswordName: 'password reset website name',
      customExpiredPasswordURL: 'http://testhost.com/test-page.html',
    };

    widgetProps = {};
  });

  it('should add correct title, subtitle, and button with no brand name', () => {
    const updatedFormBag = transformReEnrollCustomPasswordExpiryWarning({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expiring.soon');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).contentType).toBe('subtitle');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('password.expiring.subtitle.generic' + ' ' + 'password.expired.custom.subtitle');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type)
      .toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.BUTTON);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('password.expired.custom.submit');
  });

  // Days to expiry, correct title
  [
    [0, 'password.expiring.today'],
    [4, 'password.expiring.title'],
    [null, 'password.expiring.soon'],
  ].forEach(([ daysToExpiry, formTitle ]) => {
    it('should add correct title with this many days to expiry: ' + daysToExpiry, () => {
      transaction.nextStep = {
        ...transaction.nextStep,
        relatesTo: {
          value: {
            settings: {
              // @ts-expect-error OKTA-598704 - daysToExpiry does not exist in IdxAuthenticator.settings type
              daysToExpiry
            }
          }
        }
      };
      
      const updatedFormBag = transformReEnrollCustomPasswordExpiryWarning({ transaction, formBag, widgetProps });
  
      expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe(formTitle);
    });
  });
  
  it('should add correct subtitle with brandName present', () => {
    widgetProps = {
      brandName: 'test brand name',
    }
    const updatedFormBag = transformReEnrollCustomPasswordExpiryWarning({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).contentType).toBe('subtitle');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('password.expiring.subtitle.specific' + ' ' + 'password.expired.custom.subtitle');
  });

  it('should add Remind me later link when skip remediation step is present', () => {
    transaction.availableSteps = [{ name: 'skip' }];
    const updatedFormBag = transformReEnrollCustomPasswordExpiryWarning({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[3].type).toBe('Link');
    expect((updatedFormBag.uischema.elements[3] as LinkElement).options?.label)
      .toBe('password.expiring.later');
  });
});
