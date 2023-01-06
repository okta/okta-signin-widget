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
  DescriptionElement,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformOktaVerifyDeviceChallengePoll } from './transformOktaVerifyDeviceChallengePoll';

describe('Transform Okta Verify Device Challenge Poll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};

  describe('where remediation is device-challenge-poll', () => {
    beforeEach(() => {
      formBag.uischema.elements = [];
      transaction.nextStep = {
        name: 'device-challenge-poll',
        relatesTo: {
          value: {
            // @ts-expect-error Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
            challengeMethod: 'CUSTOM_URI',
            href: 'okta-verify.html',
            downloadHref: 'https://apps.apple.com/us/app/okta-verify/id490179405',
          },
        },
      };
    });

    it('should transform elements when challengeMethod is CUSTOM_URI', () => {
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('customUri.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('customUri.required.content.prompt');
      expect((updatedFormBag.uischema.elements[2] as OpenOktaVerifyFPButtonElement).options.href)
        .toBe('okta-verify.html');
      expect((updatedFormBag.uischema.elements[3] as DescriptionElement).options.content)
        .toBe('customUri.required.content.download.title');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
        .toBe('customUri.required.content.download.linkText');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.href)
        .toBe('https://apps.apple.com/us/app/okta-verify/id490179405');
    });
  });

  describe('where remediation is challenge-poll', () => {
    beforeEach(() => {
      formBag.uischema.elements = [];
      transaction.nextStep = {
        name: 'challenge-poll',
        relatesTo: {
          value: {
            contextualData: {
              // @ts-expect-error Property 'challenge' does not exist
              challenge: {
                value: {
                  challengeMethod: 'CUSTOM_URI',
                  href: 'okta-verify.html',
                  downloadHref: 'https://apps.apple.com/us/app/okta-verify/id490179405',
                }
              }
            }
          },
        },
      };
    });

    it('should transform elements when challengeMethod is CUSTOM_URI', () => {
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('customUri.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('customUri.required.content.prompt');
      expect((updatedFormBag.uischema.elements[2] as OpenOktaVerifyFPButtonElement).options.href)
        .toBe('okta-verify.html');
      expect((updatedFormBag.uischema.elements[3] as DescriptionElement).options.content)
        .toBe('customUri.required.content.download.title');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
        .toBe('customUri.required.content.download.linkText');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.href)
        .toBe('https://apps.apple.com/us/app/okta-verify/id490179405');
    });
  });
});
