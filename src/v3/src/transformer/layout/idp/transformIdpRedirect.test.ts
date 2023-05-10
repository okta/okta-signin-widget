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
  ButtonElement,
  TitleElement,
  WidgetProps,
} from '../../../types';
import { transformIdpRedirect } from './transformIdpRedirect';

describe('IDP Redirect transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  describe('IDP Redirect page tests', () => {
    beforeEach(() => {
      transaction.nextStep = {
        name: IDX_STEP.REDIRECT_IDP,
      };
      transaction.neededToProceed = [
        {
          name: 'redirect-idp',
          type: 'GOOGLE',
          idp: {
            id: 'google-123',
            name: 'Google IDP',
          },
          href: 'testURL',
          method: 'GET',
        },
        {
          name: 'redirect-idp',
          type: 'FACEBOOK',
          idp: {
            id: 'facebook-123',
            name: 'Facebook IDP',
          },
          href: 'testURL',
          method: 'GET',
        },
      ];
      widgetProps = {};
    });

    it('should add correct title and IDP buttons', () => {
      const updatedFormBag = transformIdpRedirect({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe('primaryauth.title');
      expect((updatedFormBag.uischema.elements[1] as ButtonElement).label)
        .toBe('socialauth.google.label');
      expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
        .toBe('socialauth.facebook.label');
    });
  });
});
