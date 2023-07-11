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

import { IDX_STEP } from '../../constants';
import { getStubFormBag, getStubTransactionWithNextStep } from '../../mocks/utils/utils';
import {
  FieldElement,
  FormBag,
  TranslationInfo,
  WidgetProps,
} from '../../types';
import { transformField } from './transformField';

describe('Field transformer tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'Please enter your first name',
        options: {
          inputMeta: {
            name: 'userProfile.firstName',
            customLabel: true,
          },
        },
      } as FieldElement,
      {
        type: 'Field',
        label: 'Please enter your last name',
        options: {
          inputMeta: {
            name: 'userProfile.lastName',
            customLabel: true,
          },
        },
      } as FieldElement,
      {
        type: 'Field',
        label: 'Please enter your email',
        options: {
          inputMeta: {
            name: 'userProfile.email',
            customLabel: false,
          },
        },
      } as FieldElement,
    ];
    widgetProps = {};
  });

  it('should use provided custom labels instead of translations', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_PROFILE,
    };
    const options = {
      transaction,
      widgetProps,
      step: IDX_STEP.IDENTIFY,
      isClientTransaction: false,
      setMessage: () => {},
    };
    const updatedFormBag = transformField(options)(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[0] as FieldElement).translations)
      .toEqual([{
        name: 'label',
        i18nKey: 'oie.user.profile.firstname',
        value: 'Please enter your first name',
        noTranslate: true,
      } as TranslationInfo]);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).translations)
      .toEqual([{
        name: 'label',
        i18nKey: 'oie.user.profile.lastname',
        value: 'Please enter your last name',
        noTranslate: true,
      } as TranslationInfo]);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).translations)
      .toEqual([{
        name: 'label',
        i18nKey: 'oie.user.profile.primary.email',
        value: 'oie.user.profile.primary.email',
        noTranslate: false,
      } as TranslationInfo]);
  });
});
