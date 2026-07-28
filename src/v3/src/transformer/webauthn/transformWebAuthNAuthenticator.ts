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

import { IdxAuthenticator, IdxContext } from '@okta/okta-auth-js';

import BrowserFeatures from '../../../../util/BrowserFeatures';
import {
  getWebAuthnI18nKey,
  getWebAuthnI18nParams,
  isPromotionPasskeys,
  shouldShowPasskeySplash,
  WEBAUTHN_I18N_KEYS,
} from '../../../../util/webauthnDisplayNameUtils';
import { IDX_STEP } from '../../constants';
import {
  AccordionLayout,
  DescriptionElement,
  HeadingElement,
  IdxStepTransformer,
  InfoboxElement,
  LinkElement,
  ListElement,
  PasskeyPromotionIllustrationElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
  WebAuthNButtonElement,
} from '../../types';
import {
  isCredentialsCreateApiAvailable,
  loc,
  webAuthNAuthenticationHandler,
  webAuthNEnrollmentHandler,
} from '../../util';

const isEnrollStep = (name?: string): boolean => (
  name === IDX_STEP.ENROLL_AUTHENTICATOR
  || name === IDX_STEP.ENROLL_AUTHENTICATOR_PROMOTION
);

const appendViewCallouts = (
  uischema: UISchemaLayout,
  name?: string,
  relatesTo?: { type?: string; value: IdxAuthenticator; },
): void => {
  const {
    contextualData: {
      activationData: {
        authenticatorSelection: {
          userVerification: enrollUserVerification = '',
        } = {},
      } = {},
      challengeData: {
        userVerification: challengeUserVerification = '',
      } = {},
    } = {},
  } = relatesTo?.value || {};
  const calloutEle: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: { content: '' },
  };
  // UV-required and Edge callouts apply to both the standard enroll remediation
  // and the promotion variant — they're driven by browser/authenticator state,
  // not by which remediation the server chose to serve.
  if (isEnrollStep(name)) {
    if (enrollUserVerification === 'required') {
      calloutEle.options.content = loc('oie.enroll.webauthn.uv.required.instructions', 'login');
      uischema.elements.unshift(calloutEle);
    }

    if (BrowserFeatures.isEdge()) {
      const edgeCalloutEle: DescriptionElement = {
        type: 'Description',
        contentType: 'subtitle',
        options: { content: loc('oie.enroll.webauthn.instructions.edge', 'login') },
      };
      uischema.elements.unshift(edgeCalloutEle);
    }
  }
  if (name === IDX_STEP.CHALLENGE_AUTHENTICATOR && challengeUserVerification === 'required') {
    calloutEle.options.content = loc('oie.verify.webauthn.uv.required.instructions', 'login');
    uischema.elements.unshift(calloutEle);
  }
};

const getCantVerifyChallengeContent = (): UISchemaLayout => ({
  type: UISchemaLayoutType.VERTICAL,
  elements: [
    {
      type: 'Heading',
      noMargin: true,
      options: {
        level: 2,
        visualLevel: 6,
        content: loc('oie.verify.webauthn.cant.verify.biometric.authenticator.title', 'login'),
      },
    } as HeadingElement,
    {
      type: 'Description',
      noMargin: true,
      options: { content: loc('oie.verify.webauthn.cant.verify.biometric.authenticator.description1', 'login') },
    } as DescriptionElement,
    {
      type: 'Description',
      options: { content: loc('oie.verify.webauthn.cant.verify.biometric.authenticator.description2', 'login') },
    } as DescriptionElement,
    {
      type: 'Heading',
      noMargin: true,
      options: {
        level: 2,
        visualLevel: 6,
        content: loc('oie.verify.webauthn.cant.verify.security.key.title', 'login'),
      },
    } as HeadingElement,
    {
      type: 'Description',
      options: { content: loc('oie.verify.webauthn.cant.verify.security.key.description', 'login') },
    } as DescriptionElement,
  ],
});

const getCantVerifyEnrollContent = (displayName: string | undefined): UISchemaLayout => ({
  type: UISchemaLayoutType.VERTICAL,
  elements: [
    {
      type: 'List',
      options: {
        items: [
          loc(getWebAuthnI18nKey({
            DEFAULT: 'oie.verify.webauthn.cant.verify.enrollment.step1',
            PASSKEYS: 'oie.verify.webauthn.passkeysRebrand.cant.verify.enrollment.step1',
            CUSTOM: 'oie.verify.webauthn.passkeysRebrand.cant.verify.enrollment.step1',
          }, displayName) || 'oie.verify.webauthn.cant.verify.enrollment.step1', 'login'),
          loc('oie.verify.webauthn.cant.verify.enrollment.step2', 'login'),
          loc('oie.verify.webauthn.cant.verify.enrollment.step3', 'login'),
          loc('oie.verify.webauthn.cant.verify.enrollment.step4', 'login'),
        ],
        type: 'ol',
      },
    } as ListElement,
  ],
});

const appendFooterAccordion = (uischema: UISchemaLayout, app: IdxContext['app'], displayName: string | undefined): void => {
  const OKTA_AUTHENTICATOR = 'Okta_Authenticator';
  const cantVerifyAccordion: AccordionLayout = {
    type: UISchemaLayoutType.ACCORDION,
    elements: [
      {
        type: 'AccordionPanel',
        key: 'cant-verify',
        variant: 'borderless',
        options: {
          id: 'cant-verify',
          summary: loc('oie.verify.webauthn.cant.verify', 'login'),
          content: app?.value?.name === OKTA_AUTHENTICATOR
            ? getCantVerifyEnrollContent(displayName)
            : getCantVerifyChallengeContent(),
        },
      },
    ],
  };
  uischema.elements.push(cantVerifyAccordion);
};

export const transformWebAuthNAuthenticator: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;
  const { nextStep: { name, relatesTo } = {}, context: { app }, availableSteps } = transaction;

  const displayName = relatesTo?.value?.displayName;
  const description = (relatesTo?.value as any)?.description;
  const isEnroll = isEnrollStep(name);
  const isPasskeySplash = isEnroll && shouldShowPasskeySplash(displayName);
  // Promotion-specific title/CTA/skip copy only applies to the "Passkeys" displayName —
  // Security Key or Biometric (DEFAULT) and Custom variants keep their standard
  // titles/CTAs even when served via enroll-authenticator-promotion.
  const isPromoPasskeys = isPromotionPasskeys(name, displayName);

  // Dynamic title based on displayName (with promotion-Passkeys override)
  let titleKey: string | null;
  let titleParams: string[];
  if (isPromoPasskeys) {
    titleKey = 'oie.enroll.authenticator.promotion.title';
    titleParams = [];
  } else {
    titleKey = isEnroll
      ? getWebAuthnI18nKey(WEBAUTHN_I18N_KEYS.ENROLL_TITLE, displayName)
      : getWebAuthnI18nKey(WEBAUTHN_I18N_KEYS.VERIFY_TITLE, displayName);
    titleParams = getWebAuthnI18nParams(displayName);
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc(titleKey, 'login', titleParams),
    },
  };

  // This verifies that the browser supports the credentials API
  // and the step is supported for this transformer
  if (isCredentialsCreateApiAvailable()) {
    const submitButtonEle: WebAuthNButtonElement = {
      type: 'WebAuthNSubmitButton',
      options: {
        step: name!,
        onClick: isEnroll
          ? () => webAuthNEnrollmentHandler(transaction)
          : () => webAuthNAuthenticationHandler(transaction),
        submitOnLoad: name === IDX_STEP.CHALLENGE_AUTHENTICATOR && !BrowserFeatures.isSafari(),
      },
    };
    uischema.elements.unshift(submitButtonEle);

    appendViewCallouts(uischema, name, relatesTo);

    // Add additional instructions if description is present
    if (description) {
      uischema.elements.unshift({
        type: 'InfoBox',
        options: {
          message: {
            class: 'INFO',
            message: description,
          },
          class: 'INFO',
          dataSe: 'additionalInstructionsCallout',
        },
      } as InfoboxElement);

      uischema.elements.unshift({
        type: 'Description',
        options: {
          content: `<strong>${loc('oie.verify.webauthn.instructions.additional', 'login')}</strong>`,
        },
      } as DescriptionElement);
    }

    // Dynamic instructions subtitle — shown on enroll/verify EXCEPT when the
    // passkey splash is rendered. In that case the splash's FAQ replaces this
    // generic line. The UV-required / Edge / additional-instructions callouts
    // (unshifted below) are unaffected either way.
    if (!isPasskeySplash) {
      const instructionsKey = isEnroll
        ? getWebAuthnI18nKey(WEBAUTHN_I18N_KEYS.ENROLL_INSTRUCTIONS, displayName)
        : getWebAuthnI18nKey(WEBAUTHN_I18N_KEYS.VERIFY_INSTRUCTIONS, displayName);
      // Note: Instructions don't need params since they're generic regardless of displayName
      const instructionsParams: string[] = [];
      uischema.elements.unshift({
        type: 'Description',
        contentType: 'subtitle',
        options: {
          content: loc(instructionsKey, 'login', instructionsParams),
        },
      } as DescriptionElement);
    }

    if (isPasskeySplash) {
      // For Passkeys / custom displayName on enrollment: prepend the rich splash
      // (illustration + 3 FAQ blocks) on top of the instructions line — additive,
      // so all other conditional elements (UV/Edge callouts, additional-instructions
      // InfoBox for custom description) still render.
      uischema.elements.unshift(
        { type: 'PasskeyPromotionIllustration', options: {} } as PasskeyPromotionIllustrationElement,
        {
          type: 'Heading',
          noMargin: true,
          options: {
            level: 2,
            visualLevel: 6,
            content: loc('oie.enroll.authenticator.promotion.faq.benefit.title', 'login'),
          },
        } as HeadingElement,
        {
          type: 'Description',
          options: { content: loc('oie.enroll.authenticator.promotion.faq.benefit.description', 'login') },
        } as DescriptionElement,
        {
          type: 'Heading',
          noMargin: true,
          options: {
            level: 2,
            visualLevel: 6,
            content: loc('oie.enroll.authenticator.promotion.faq.definition.title', 'login'),
          },
        } as HeadingElement,
        {
          type: 'Description',
          options: { content: loc('oie.enroll.authenticator.promotion.faq.definition.description', 'login') },
        } as DescriptionElement,
        {
          type: 'Heading',
          noMargin: true,
          options: {
            level: 2,
            visualLevel: 6,
            content: loc('oie.enroll.authenticator.promotion.faq.storage.title', 'login'),
          },
        } as HeadingElement,
        {
          type: 'Description',
          options: { content: loc('oie.enroll.authenticator.promotion.faq.storage.description', 'login') },
        } as DescriptionElement,
      );
    }
  } else {
    const notSupportedKey = getWebAuthnI18nKey({
      DEFAULT: 'oie.webauthn.error.not.supported',
      PASSKEYS: 'oie.webauthn.passkeysRebrand.error.not.supported',
      CUSTOM: 'oie.webauthn.passkeysRebrand.error.not.supported',
    }, displayName) || 'oie.webauthn.error.not.supported';
    uischema.elements.unshift({
      type: 'InfoBox',
      options: {
        message: {
          class: 'ERROR',
          message: loc(notSupportedKey, 'login'),
          i18n: { key: notSupportedKey },
        },
        class: 'ERROR',
        dataSe: 'callout',
      },
    } as InfoboxElement);
  }

  uischema.elements.unshift(titleElement);
  if (name === IDX_STEP.CHALLENGE_AUTHENTICATOR) {
    appendFooterAccordion(uischema, app, displayName);
  }

  // Surface the "Maybe later" skip link ONLY on the promotion remediation. The API
  // is expected to always ship a sibling `skip` on that remediation; scoping by
  // step name (not just presence of `skip`) keeps the promotion-specific label
  // from leaking into other WebAuthN flows (standard enroll, challenge).
  if (name === IDX_STEP.ENROLL_AUTHENTICATOR_PROMOTION) {
    const skipStep = availableSteps?.find(({ name: stepName }) => stepName === 'skip');
    if (skipStep) {
      uischema.elements.push({
        type: 'Link',
        options: {
          label: loc('oie.enroll.authenticator.promotion.skip', 'login'),
          step: skipStep.name,
          isActionStep: false,
        },
      } as LinkElement);
    }
  }

  return formBag;
};
