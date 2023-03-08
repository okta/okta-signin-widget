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
  LinkElement, LoopbackProbeElement, SpinnerElement, TitleElement, WidgetProps,
} from '../../../types';
import * as utils from '../../../util/idxUtils';
import { transformOktaVerifyFPLoopbackPoll } from './transformOktaVerifyFPLoopbackPoll';

describe('Transform Okta Verify FP Loopback Poll', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  describe('where remediation is device-challenge-poll', () => {
    beforeEach(() => {
      formBag.uischema.elements = [];
      transaction.nextStep = {
        name: 'device-challenge-poll',
        relatesTo: {
          value: {
            // @ts-expect-error ports does not exist on IdxAuthenticator
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
          },
        },
      };
      transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE }];
      jest.spyOn(utils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
    });

    it('should create Loopback Poll elements for display when step is device-challenge-poll', () => {
      const updatedFormBag = transformOktaVerifyFPLoopbackPoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).type)
        .toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('deviceTrust.sso.redirectText');
      expect((updatedFormBag.uischema.elements[1] as SpinnerElement).type)
        .toBe('Spinner');
      expect((updatedFormBag.uischema.elements[2] as LoopbackProbeElement).type)
        .toBe('LoopbackProbe');
      expect((updatedFormBag.uischema.elements[2] as LoopbackProbeElement).options)
        .toStrictEqual({
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
        });
      expect((updatedFormBag.uischema.elements[3] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.step)
        .toBe('authenticatorChallenge-cancel');
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
              // @ts-expect-error challenge does not exist on contextualData
              challenge: {
                value: {
                  ports: ['2000', '6511', '6512', '6513'],
                  domain: 'http://localhost',
                  challengeRequest: 'mockChallengeRequest',
                },
              },
            },
          },
        },
      };
      transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE }];
      jest.spyOn(utils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
    });

    it('should create Loopback Poll elements for display', () => {
      const updatedFormBag = transformOktaVerifyFPLoopbackPoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).type)
        .toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('deviceTrust.sso.redirectText');
      expect((updatedFormBag.uischema.elements[1] as SpinnerElement).type)
        .toBe('Spinner');
      expect((updatedFormBag.uischema.elements[2] as LoopbackProbeElement).type)
        .toBe('LoopbackProbe');
      expect((updatedFormBag.uischema.elements[2] as LoopbackProbeElement).options)
        .toStrictEqual({
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
          },
          cancelStep: 'currentAuthenticator-cancel',
          step: 'challenge-poll',
        });
      expect((updatedFormBag.uischema.elements[3] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.step)
        .toBe('currentAuthenticator-cancel');
    });
  });
});
