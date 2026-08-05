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
  ActionPendingElement,
  InfoboxElement,
  LinkElement,
  LoopbackProbeElement,
  TitleElement,
  WidgetProps,
} from '../../../types';
import { markChromeLNADeniedTransaction } from '../../../util/browserUtils';
import * as idxUtils from '../../../util/idxUtils';
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
      jest.spyOn(idxUtils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
    });

    it('should create Loopback Poll elements for display when step is device-challenge-poll', () => {
      const updatedFormBag = transformOktaVerifyFPLoopbackPoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect(updatedFormBag.uischema.elements[0].type).toBe('ActionPending');
      expect((updatedFormBag.uischema.elements[0] as ActionPendingElement).options.content)
        .toBe('deviceTrust.sso.redirectText');
      expect((updatedFormBag.uischema.elements[1] as LoopbackProbeElement).type)
        .toBe('LoopbackProbe');
      expect((updatedFormBag.uischema.elements[1] as LoopbackProbeElement).options)
        .toStrictEqual({
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
          showLNARemediationOnFailure: false,
        });
      expect((updatedFormBag.uischema.elements[2] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[3] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[3] as LinkElement).options.step)
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
      jest.spyOn(idxUtils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
    });

    it('should create Loopback Poll elements for display', () => {
      const updatedFormBag = transformOktaVerifyFPLoopbackPoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect(updatedFormBag.uischema.elements[0].type).toBe('ActionPending');
      expect((updatedFormBag.uischema.elements[0] as ActionPendingElement).options.content)
        .toBe('deviceTrust.sso.redirectText');
      expect((updatedFormBag.uischema.elements[1] as LoopbackProbeElement).type)
        .toBe('LoopbackProbe');
      expect((updatedFormBag.uischema.elements[1] as LoopbackProbeElement).options)
        .toStrictEqual({
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
          },
          cancelStep: 'currentAuthenticator-cancel',
          step: 'challenge-poll',
          showLNARemediationOnFailure: false,
        });
      expect((updatedFormBag.uischema.elements[2] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[3] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[3] as LinkElement).options.step)
        .toBe('currentAuthenticator-cancel');
    });
  });

  describe('where chromeLocalNetworkAccessDetails are defined', () => {
    const prevTransaction = getStubTransactionWithNextStep();

    beforeEach(() => {
      transaction.nextStep = {
        name: 'device-challenge-poll',
        relatesTo: {
          value: {
            // @ts-expect-error ports does not exist on IdxAuthenticator
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
            chromeLocalNetworkAccessDetails: {
              chromeLNAHelpLink: 'https://okta.com',
            },
          },
        },
      };
      transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE }];
    });

    // The LNA permission is no longer checked upfront in the transformer. The loopback is
    // always attempted; the LoopbackProbe surfaces LNA remediation only after a genuine
    // failure with a blocked permission, then marks the transaction so this transformer
    // renders the error layout (see the marked-transaction test below).
    it('creates Loopback Poll elements with showLNARemediationOnFailure=true for an interactive challenge', () => {
      // A defined prevTransaction.nextStep.name means this is not a registered-condition silent probe
      prevTransaction.nextStep = {
        name: IDX_STEP.IDENTIFY,
      };

      const updatedFormBag = transformOktaVerifyFPLoopbackPoll({
        prevTransaction,
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect(updatedFormBag.uischema.elements[0].type).toBe('ActionPending');
      expect((updatedFormBag.uischema.elements[0] as ActionPendingElement).options.content)
        .toBe('deviceTrust.sso.redirectText');
      expect(updatedFormBag.uischema.elements[1].type)
        .toBe('LoopbackProbe');
      expect((updatedFormBag.uischema.elements[1] as LoopbackProbeElement).options)
        .toStrictEqual({
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
            chromeLocalNetworkAccessDetails: {
              chromeLNAHelpLink: 'https://okta.com',
            },
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
          showLNARemediationOnFailure: true,
        });
      expect(updatedFormBag.uischema.elements[2].type).toBe('Link');
      expect((updatedFormBag.uischema.elements[2] as LinkElement).options.label)
        .toBe('goback');
    });

    it('creates Loopback Poll elements with showLNARemediationOnFailure=false for a registered condition silent probe', () => {
      // An undefined prevTransaction.nextStep.name means this is a silent probe triggered by
      // the registered condition; a silent probe must never show the terminal LNA error
      prevTransaction.nextStep = {
        name: undefined as unknown as string,
      };

      const updatedFormBag = transformOktaVerifyFPLoopbackPoll({
        prevTransaction,
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect(updatedFormBag.uischema.elements[0].type).toBe('ActionPending');
      expect((updatedFormBag.uischema.elements[0] as ActionPendingElement).options.content)
        .toBe('deviceTrust.sso.redirectText');
      expect(updatedFormBag.uischema.elements[1].type).toBe('LoopbackProbe');
      expect((updatedFormBag.uischema.elements[1] as LoopbackProbeElement).options)
        .toStrictEqual({
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
            chromeLocalNetworkAccessDetails: {
              chromeLNAHelpLink: 'https://okta.com',
            },
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
          showLNARemediationOnFailure: false,
        });
      expect(updatedFormBag.uischema.elements[2].type).toBe('Link');
      expect((updatedFormBag.uischema.elements[2] as LinkElement).options.label)
        .toBe('goback');
    });

    it('creates error remediation elements when the transaction is marked as LNA-denied', () => {
      // LoopbackProbe marks the transaction once a loopback failure is attributed to a
      // blocked LNA permission; the transformer then renders the remediation view.
      const deniedTransaction = markChromeLNADeniedTransaction(transaction);

      const updatedFormBag = transformOktaVerifyFPLoopbackPoll({
        transaction: deniedTransaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content).toBe('chrome.lna.fastpass.requires.permission.title');
      expect(updatedFormBag.uischema.elements[1].type).toBe('InfoBox');
      expect((
        updatedFormBag.uischema.elements[1] as InfoboxElement
      ).options?.message).toEqual(
        [
          {
            title: 'chrome.lna.error.title',
            message: 'chrome.lna.error.description.intro',
          },
          {
            options: [
              {
                type: 'text',
                label: 'chrome.lna.error.description.step1',
              },
              {
                type: 'text',
                label: 'chrome.lna.error.description.step2',
              },
              {
                type: 'text',
                label: 'chrome.lna.error.description.step3',
              },
            ],
            listStyleType: 'decimal',
          },
          {
            message:
              'chrome.lna.error.description.more.information',
          },
        ],
      );
      expect((
        updatedFormBag.uischema.elements[1] as InfoboxElement
      ).options?.class).toBe('ERROR');
      expect(updatedFormBag.uischema.elements[2].type).toBe('Link');
      expect((updatedFormBag.uischema.elements[2] as LinkElement).options.label).toBe('goback');
    });
  });
});
