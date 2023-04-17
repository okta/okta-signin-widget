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

import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  DuoWindowElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformDuoAuthenticator } from '.';

describe('Duo Authenticator Transformer Tests', () => {
  let transaction = getStubTransactionWithNextStep();
  let widgetProps: WidgetProps = {};
  let formBag = getStubFormBag();

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    widgetProps = {};
    transaction = {
      ...transaction,
      nextStep: {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        relatesTo: {
          value: {
            contextualData: {
              // @ts-expect-error OKTA-601240 : missing property from contextualData type
              host: 'testhost',
              signedToken: 'testSignedToken',
            },
          },
        },
      },
    };
  });

  it('should add correct title and DuoWindow in enroll flow', () => {
    const updatedFormBag = transformDuoAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.duo.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('DuoWindow');
    expect((updatedFormBag.uischema.elements[1] as DuoWindowElement).options?.host)
      .toBe('testhost');
    expect((updatedFormBag.uischema.elements[1] as DuoWindowElement).options?.signedToken)
      .toBe('testSignedToken');
  });

  it('should add correct title and DuoWindow in verify flow', () => {
    transaction.nextStep!.name = IDX_STEP.CHALLENGE_AUTHENTICATOR;
    const updatedFormBag = transformDuoAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.duo.verify.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('DuoWindow');
    expect((updatedFormBag.uischema.elements[1] as DuoWindowElement).options?.host)
      .toBe('testhost');
    expect((updatedFormBag.uischema.elements[1] as DuoWindowElement).options?.signedToken)
      .toBe('testSignedToken');
  });
});
