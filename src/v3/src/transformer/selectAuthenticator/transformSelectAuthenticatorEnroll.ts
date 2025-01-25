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

import { NextStep } from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';

import {
  AuthenticatorButtonListElement,
  ButtonElement,
  ButtonType,
  DescriptionElement,
  HeadingElement,
  IdxStepTransformer,
  TitleElement,
} from '../../types';
import { getLanguageCode, loc } from '../../util';
import { getAuthenticatorEnrollButtonElements } from './utils';

const getContentDescrAndParams = (brandName?: string): TitleElement['options'] => {
  if (brandName) {
    return {
      content: loc('oie.select.authenticators.enroll.subtitle.custom', 'login', [brandName]),
    };
  }
  return { content: loc('oie.select.authenticators.enroll.subtitle', 'login') };
};

const isGracePeriodStillActive = (expiry: string): boolean => {
  const currentTimestampMs = new Date().getTime();
  const gracePeriod = new Date(expiry);
  return !Number.isNaN(gracePeriod.getTime()) && currentTimestampMs < gracePeriod.getTime();
};

export const transformSelectAuthenticatorEnroll: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { uischema } = formBag;
  const { brandName } = widgetProps;
  const {
    nextStep: { inputs, name: stepName } = {} as NextStep,
    availableSteps,
    // @ts-ignore OKTA-499928 authenticatorEnrollments missing from rawIdxState
    rawIdxState: { authenticatorEnrollments },
  } = transaction;

  const authenticator = inputs?.find(({ name }) => name === 'authenticator');
  if (!authenticator?.options?.length) {
    return formBag;
  }

  const langaugeCode = getLanguageCode(widgetProps);
  const authenticatorsWithGracePeriod : IdxOption[] = [];
  const authenticatorsDueNow : IdxOption[] = [];
  authenticator.options.forEach((option) => {
    // @ts-ignore TODO: Add grace period fields to auth-js SDK https://oktainc.atlassian.net/browse/OKTA-848910
    if (option.relatesTo?.gracePeriod?.expiry
      // @ts-ignore TODO: Add grace period fields to auth-js SDK https://oktainc.atlassian.net/browse/OKTA-848910
      && isGracePeriodStillActive(option.relatesTo?.gracePeriod?.expiry)) {
      authenticatorsWithGracePeriod.push(option);
    } else {
      authenticatorsDueNow.push(option);
    }
  });

  const authenticatorButtonsWithGracePeriod = getAuthenticatorEnrollButtonElements(
    authenticatorsWithGracePeriod,
    stepName,
    langaugeCode,
    authenticatorEnrollments?.value,
  );

  const authenticatorButtonsDueNow = getAuthenticatorEnrollButtonElements(
    authenticatorsDueNow,
    stepName,
    langaugeCode,
    authenticatorEnrollments?.value,
  );
  const skipStep = availableSteps?.find(({ name }) => name === 'skip');

  const title: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.select.authenticators.enroll.title', 'login'),
    },
  };
  const description: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: getContentDescrAndParams(brandName),
  };

  const headingRequiredNow: HeadingElement = {
    type: 'Heading',
    options: {
      content: loc('oie.setup.required.now', 'login'),
      level: 3,
      visualLevel: 6,
      dataSe: 'authenticator-list-title',
    },
  };

  const headingRequiredSoon: HeadingElement = {
    type: 'Heading',
    options: {
      content: loc('oie.setup.required.soon', 'login'),
      level: 3,
      visualLevel: 6,
      dataSe: 'authenticator-list-title',
    },
  };

  const headingNoGracePeriod: HeadingElement = {
    type: 'Heading',
    options: {
      content: skipStep ? loc('oie.setup.optional.short', 'login') : loc('oie.setup.required.now', 'login'),
      level: 3,
      visualLevel: 6,
    },
  };

  const descriptionGracePeriod: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.setup.required.soon.description', 'login'),
    },
  };

  const authenticatorListElementWithGracePeriod: AuthenticatorButtonListElement[] = [];
  if (authenticatorButtonsWithGracePeriod.length) {
    authenticatorListElementWithGracePeriod.push({
      type: 'AuthenticatorButtonList',
      options: { buttons: authenticatorButtonsWithGracePeriod, dataSe: 'authenticator-enroll-list-grace-period' },
    });
  }

  const authenticatorListElementDueNow: AuthenticatorButtonListElement[] = [];
  if (authenticatorButtonsDueNow.length) {
    authenticatorListElementDueNow.push({
      type: 'AuthenticatorButtonList',
      options: { buttons: authenticatorButtonsDueNow, dataSe: 'authenticator-enroll-list' },
    });
  }

  const skipButton: ButtonElement = {
    type: 'Button',
    label: authenticatorListElementWithGracePeriod.length
      ? loc('oie.setup.remind.me.later', 'login')
      : loc('oie.optional.authenticator.button.title', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: 'skip',
    },
  };

  // 3 situations - required soon + required now, all required soon, all required now
  // when grace periods are past required and should be treated as normal required
  if (authenticatorListElementDueNow.length && authenticatorListElementWithGracePeriod.length) {
    uischema.elements = [
      title,
      description,
      headingRequiredNow,
      ...authenticatorListElementDueNow,
      headingRequiredSoon,
      descriptionGracePeriod,
      ...authenticatorListElementWithGracePeriod,
      ...(skipStep ? [skipButton] : []),
    ];
  } else if (authenticatorListElementWithGracePeriod.length) {
    uischema.elements = [
      title,
      description,
      headingRequiredSoon,
      descriptionGracePeriod,
      ...authenticatorListElementWithGracePeriod,
      ...(skipStep ? [skipButton] : []),
    ];
  } else {
    uischema.elements = [
      title,
      description,
      headingNoGracePeriod,
      ...authenticatorListElementDueNow,
      ...(skipStep ? [skipButton] : []),
    ];
  }

  return formBag;
};
