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
import { IDX_STEP } from '../../constants';
import {
  AccordionLayout,
  DescriptionElement,
  HeadingElement,
  IdxStepTransformer,
  InfoboxElement,
  ListElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
  WebAuthNButtonElement,
} from '../../types';
import {
  isCredentialsApiAvailable,
  loc,
  webAuthNAuthenticationHandler,
  webAuthNEnrollmentHandler,
} from '../../util';
import {
  getWebAuthnI18nKey,
  getWebAuthnI18nParams,
  shouldShowWebAuthnAdditionalInstructions,
  WEBAUTHN_I18N_KEYS,
} from '../../util/webauthnDisplayNameUtils';

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
  if (name === IDX_STEP.ENROLL_AUTHENTICATOR) {
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

const getCantVerifyEnrollContent = (): UISchemaLayout => ({
  type: UISchemaLayoutType.VERTICAL,
  elements: [
    {
      type: 'List',
      options: {
        items: [
          loc('oie.verify.webauthn.cant.verify.enrollment.step1', 'login'),
          loc('oie.verify.webauthn.cant.verify.enrollment.step2', 'login'),
          loc('oie.verify.webauthn.cant.verify.enrollment.step3', 'login'),
          loc('oie.verify.webauthn.cant.verify.enrollment.step4', 'login'),
        ],
        type: 'ol',
      },
    } as ListElement,
  ],
});

const appendFooterAccordion = (uischema: UISchemaLayout, app: IdxContext['app']): void => {
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
            ? getCantVerifyEnrollContent()
            : getCantVerifyChallengeContent(),
        },
      },
    ],
  };
  uischema.elements.push(cantVerifyAccordion);
};

export const transformWebAuthNAuthenticator: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;
  const { nextStep: { name, relatesTo } = {}, context: { app } } = transaction;

  const displayName = relatesTo?.value?.displayName;
  const description = (relatesTo?.value as any)?.description;
  const isEnroll = name === IDX_STEP.ENROLL_AUTHENTICATOR;

  // Dynamic title based on displayName
  const titleKey = isEnroll
    ? getWebAuthnI18nKey(WEBAUTHN_I18N_KEYS.ENROLL_TITLE, displayName)
    : getWebAuthnI18nKey(WEBAUTHN_I18N_KEYS.VERIFY_TITLE, displayName);
  const titleParams = getWebAuthnI18nParams(displayName);

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc(titleKey, 'login', titleParams),
    },
  };

  // This verifies that the browser supports the credentials API
  // and the step is supported for this transformer
  if (isCredentialsApiAvailable()) {
    const submitButtonEle: WebAuthNButtonElement = {
      type: 'WebAuthNSubmitButton',
      options: {
        step: name!,
        onClick: name === IDX_STEP.ENROLL_AUTHENTICATOR
          ? () => webAuthNEnrollmentHandler(transaction)
          : () => webAuthNAuthenticationHandler(transaction),
        submitOnLoad: name === IDX_STEP.CHALLENGE_AUTHENTICATOR && !BrowserFeatures.isSafari(),
      },
    };
    uischema.elements.unshift(submitButtonEle);

    appendViewCallouts(uischema, name, relatesTo);

    // Add custom instructions if applicable (for custom displayName with description)
    if (shouldShowWebAuthnAdditionalInstructions(displayName, description)) {
      uischema.elements.unshift({
        type: 'InfoBox',
        options: {
          message: {
            class: 'INFO',
            message: description!,
          },
          class: 'INFO',
          dataSe: 'callout',
        },
      } as InfoboxElement);

      uischema.elements.unshift({
        type: 'Description',
        options: {
          content: `<strong>${loc('oie.verify.webauthn.instructions.additional', 'login')}</strong>`,
        },
      } as DescriptionElement);
    }

    // Dynamic instructions based on displayName
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
  } else {
    uischema.elements.unshift({
      type: 'InfoBox',
      options: {
        message: {
          class: 'ERROR',
          message: loc('oie.webauthn.error.not.supported', 'login'),
          i18n: { key: 'oie.webauthn.error.not.supported' },
        },
        class: 'ERROR',
        dataSe: 'callout',
      },
    } as InfoboxElement);
  }

  uischema.elements.unshift(titleElement);
  if (name === IDX_STEP.CHALLENGE_AUTHENTICATOR) {
    appendFooterAccordion(uischema, app);
  }

  return formBag;
};
