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
import { ChromeLNADeniedError } from 'util/Errors';

import {
  ActionPendingElement,
  InfoboxElement,
  LinkElement,
  LoopbackProbeElement,
  TitleElement,
  WidgetProps,
} from '../../../types';
import * as browserUtils from '../../../util/browserUtils';
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

    const mockChromeLNAPermissionState = (permissionState: PermissionState) => {
      jest.spyOn(browserUtils, 'getChromeLNAPermissionState').mockImplementation((handlePermissionState) => {
        handlePermissionState(permissionState);
        return Promise.resolve();
      });
    };

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

    it.each(['prompt', 'granted'])('should create Loopback Poll elements for display when permission state is "%s"', (permissionState) => {
      mockChromeLNAPermissionState(permissionState as PermissionState);

      const updatedFormBag = transformOktaVerifyFPLoopbackPoll({
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
        });
      expect(updatedFormBag.uischema.elements[2].type).toBe('Link');
      expect((updatedFormBag.uischema.elements[2] as LinkElement).options.label)
        .toBe('goback');
    });

    it('should create Loopback Poll elements for display when permission state is "denied" and loopback is triggered by registered condition silent probe', () => {
      // Explicitly mock no previous transaction through an undefined prevTransaction.nextStep.name, which happens when
      // a silent loopback probe is triggered by the registered condition
      prevTransaction.nextStep = {
        name: undefined as unknown as string,
      };
      mockChromeLNAPermissionState('denied');

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
        });
      expect(updatedFormBag.uischema.elements[2].type).toBe('Link');
      expect((updatedFormBag.uischema.elements[2] as LinkElement).options.label)
        .toBe('goback');
    });

    it('should create error remediation elements when permission state is "denied" and loopback is not triggered by registered condition silent probe', () => {
      // Explicitly mock a previous transaction with a defined prevTransaction.nextStep.name, which happens when
      // a loopback probe is not triggered by the registered condition
      prevTransaction.nextStep = {
        name: IDX_STEP.IDENTIFY,
      };
      mockChromeLNAPermissionState('denied');

      expect(() => {
        transformOktaVerifyFPLoopbackPoll({
          prevTransaction,
          transaction,
          formBag,
          widgetProps,
        });
      }).toThrowError(ChromeLNADeniedError);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(3);
      expect(formBag.uischema.elements[0].type).toBe('Title');
      expect((formBag.uischema.elements[0] as TitleElement).options.content).toBe('chrome.lna.fastpass.requires.permission.title');
      expect(formBag.uischema.elements[1].type).toBe('InfoBox');
      expect((
        formBag.uischema.elements[1] as InfoboxElement
      ).options?.message).toEqual(
        [
          {
            title: 'chrome.lna.error.title',
            message: 'chrome.lna.error.description.part1',
          },
          {
            message: 'chrome.lna.error.description.part2',
          },
          {
            message:
              'chrome.lna.error.description.more.information',
          },
        ],
      );
      expect((
        formBag.uischema.elements[1] as InfoboxElement
      ).options?.class).toBe('ERROR');
      expect(formBag.uischema.elements[2].type).toBe('Link');
      expect((formBag.uischema.elements[2] as LinkElement).options.label).toBe('goback');
    });
  });
});
