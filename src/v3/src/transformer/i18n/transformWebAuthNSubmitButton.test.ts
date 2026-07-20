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

import { IdxAuthenticator, IdxTransaction } from '@okta/okta-auth-js';
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FormBag,
  TranslationInfo,
  WebAuthNButtonElement,
} from 'src/types';

import { transformWebAuthNSubmitButton } from './transformWebAuthNSubmitButton';

describe('transformWebAuthNSubmitButton', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;

  const stubButton = (): WebAuthNButtonElement => ({
    type: 'WebAuthNSubmitButton',
    options: {
      step: '',
      onClick: jest.fn(),
    },
  });

  const getLabelTranslation = (element: WebAuthNButtonElement): TranslationInfo | undefined => (
    element.translations?.find(({ name }) => name === 'label')
  );

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    formBag.uischema.elements = [stubButton()];
  });

  describe('enroll steps', () => {
    it('labels the CTA "Create a passkey" on enroll-authenticator-promotion with Passkeys displayName', () => {
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR_PROMOTION,
        relatesTo: { type: '', value: { displayName: 'Passkeys' } as IdxAuthenticator },
      };

      const updated = transformWebAuthNSubmitButton({
        transaction, widgetProps: {}, step: '', isClientTransaction: false, setMessage: () => {},
      })(formBag);

      expect(getLabelTranslation(updated.uischema.elements[0] as WebAuthNButtonElement))
        .toEqual({
          name: 'label',
          i18nKey: 'oie.enroll.authenticator.promotion.cta.createPasskey',
          value: 'oie.enroll.authenticator.promotion.cta.createPasskey',
        });
    });

    it('keeps the default "Set up" CTA on enroll-authenticator-promotion with Security Key or Biometric displayName', () => {
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR_PROMOTION,
        relatesTo: { type: '', value: { displayName: 'Security Key or Biometric' } as IdxAuthenticator },
      };

      const updated = transformWebAuthNSubmitButton({
        transaction, widgetProps: {}, step: '', isClientTransaction: false, setMessage: () => {},
      })(formBag);

      expect(getLabelTranslation(updated.uischema.elements[0] as WebAuthNButtonElement))
        .toEqual({
          name: 'label',
          i18nKey: 'oie.enroll.webauthn.save',
          value: 'oie.enroll.webauthn.save',
        });
    });

    it('keeps the default "Set up" CTA on enroll-authenticator-promotion with a custom displayName', () => {
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR_PROMOTION,
        relatesTo: { type: '', value: { displayName: 'YubiKey' } as IdxAuthenticator },
      };

      const updated = transformWebAuthNSubmitButton({
        transaction, widgetProps: {}, step: '', isClientTransaction: false, setMessage: () => {},
      })(formBag);

      expect(getLabelTranslation(updated.uischema.elements[0] as WebAuthNButtonElement))
        .toEqual({
          name: 'label',
          i18nKey: 'oie.enroll.webauthn.save',
          value: 'oie.enroll.webauthn.save',
        });
    });

    it('keeps the default "Set up" CTA on standard enroll-authenticator with Passkeys displayName (regression guard)', () => {
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        relatesTo: { type: '', value: { displayName: 'Passkeys' } as IdxAuthenticator },
      };

      const updated = transformWebAuthNSubmitButton({
        transaction, widgetProps: {}, step: '', isClientTransaction: false, setMessage: () => {},
      })(formBag);

      expect(getLabelTranslation(updated.uischema.elements[0] as WebAuthNButtonElement))
        .toEqual({
          name: 'label',
          i18nKey: 'oie.enroll.webauthn.save',
          value: 'oie.enroll.webauthn.save',
        });
    });
  });

  describe('challenge step', () => {
    it('labels the CTA "Verify" and adds a retry-label on challenge-authenticator', () => {
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        relatesTo: { type: '', value: { displayName: 'Passkeys' } as IdxAuthenticator },
      };

      const updated = transformWebAuthNSubmitButton({
        transaction, widgetProps: {}, step: '', isClientTransaction: false, setMessage: () => {},
      })(formBag);

      const button = updated.uischema.elements[0] as WebAuthNButtonElement;
      expect(getLabelTranslation(button))
        .toEqual({
          name: 'label',
          i18nKey: 'mfa.challenge.verify',
          value: 'mfa.challenge.verify',
        });
      expect(button.translations?.find(({ name }) => name === 'retry-label'))
        .toEqual({
          name: 'retry-label',
          i18nKey: 'retry',
          value: 'retry',
        });
    });
  });
});
