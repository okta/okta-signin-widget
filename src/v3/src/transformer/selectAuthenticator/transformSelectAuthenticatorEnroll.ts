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
import { getLanguageTags } from 'util/LanguageUtil';

import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  ButtonElement,
  ButtonType,
  DescriptionElement,
  HeadingElement,
  IdxStepTransformer,
  LinkElement,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { getGracePeriodRequiredSoonCustomLink, getSupportedLanguages, loc } from '../../util';
import {
  AuthenticatorGroup,
  getAuthenticatorEnrollButtonElements,
  GroupedSectionItem,
  isAuthenticatorButtonInGracePeriod,
  partitionGroupedEnrollButtons,
} from './utils';

const getContentDescrAndParams = (brandName?: string): TitleElement['options'] => {
  if (brandName) {
    return {
      content: loc('oie.select.authenticators.enroll.subtitle.custom', 'login', [brandName]),
    };
  }
  return { content: loc('oie.select.authenticators.enroll.subtitle', 'login') };
};

const isGracePeriodExpiryStillActive = (expiry: string): boolean => {
  const currentTimestampMs = Date.now();
  const gracePeriodTimestampMs = new Date(expiry).getTime();
  // using isNaN as ie11 does not support Number.isNaN
  // eslint-disable-next-line no-restricted-globals
  return !isNaN(gracePeriodTimestampMs) && currentTimestampMs < gracePeriodTimestampMs;
};

const buildRequiredSoonHeading = (): HeadingElement => ({
  type: 'Heading',
  options: {
    content: loc('oie.setup.required.soon', 'login'),
    level: 2,
    visualLevel: 6,
    dataSe: 'authenticator-list-title',
  },
});

const buildRequiredNowHeading = (): HeadingElement => ({
  type: 'Heading',
  options: {
    content: loc('oie.setup.required.now', 'login'),
    level: 2,
    visualLevel: 6,
    dataSe: 'authenticator-list-title',
  },
});

const buildRequiredSoonDescription = (): DescriptionElement => ({
  type: 'Description',
  contentType: 'subtitle',
  options: {
    content: loc('oie.setup.required.soon.description', 'login'),
  },
});

type GracePeriodCustomLinkWidgetProps = Parameters<typeof getGracePeriodRequiredSoonCustomLink>[0];

const buildCustomLink = (
  widgetProps: GracePeriodCustomLinkWidgetProps,
): LinkElement | undefined => {
  const customLink = getGracePeriodRequiredSoonCustomLink(widgetProps);
  if (customLink?.href && customLink?.text) {
    return {
      type: 'Link',
      options: {
        href: customLink.href,
        target: '_blank',
        step: '',
        label: customLink.text,
        dataSe: 'gracePeriodRequiredSoonCustomLink',
      },
    };
  }
  return undefined;
};

// Expand a grouped-section bucket into UI elements. Bare buttons collapse into
// a single AuthenticatorButtonList; each card is a standalone element.
const sectionElements = (
  items: GroupedSectionItem[],
  dataSe: string,
): UISchemaElement[] => {
  const out: UISchemaElement[] = [];
  const bareButtons = items.filter((i): i is Extract<GroupedSectionItem, { kind: 'bare' }> => i.kind === 'bare').map((i) => i.button);
  const cards = items.filter((i): i is Extract<GroupedSectionItem, { kind: 'card' }> => i.kind === 'card').map((i) => i.card);
  if (bareButtons.length > 0) {
    const list: AuthenticatorButtonListElement = {
      type: 'AuthenticatorButtonList',
      options: { buttons: bareButtons, dataSe },
    };
    out.push(list);
  }
  cards.forEach((card) => out.push(card));
  return out;
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
    rawIdxState: { authenticatorEnrollments, authenticatorGroups },
  } = transaction;

  const authenticator = inputs?.find(({ name }) => name === 'authenticator');
  if (!authenticator?.options?.length) {
    return formBag;
  }

  const supportedLanguages = getSupportedLanguages(widgetProps);
  const languageTags = getLanguageTags(widgetProps.language, supportedLanguages);

  // Trigger the N-of-M path only when at least one REQUIRED group has
  // remaining > 0. Otherwise take the legacy per-authenticator gracePeriod path
  // — this guarantees legacy responses render byte-identically to today.
  const groups = authenticatorGroups as AuthenticatorGroup[] | undefined;
  const hasActiveGroup = Array.isArray(groups) && groups.some((g) => g && g.remaining > 0);

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

  const skipStep = availableSteps?.find(({ name }) => name === 'skip');

  if (hasActiveGroup) {
    // ---- N-of-M grouped path -----------------------------------------------
    const allButtons: AuthenticatorButtonElement[] = getAuthenticatorEnrollButtonElements(
      authenticator.options as IdxOption[],
      stepName as string,
      languageTags,
      authenticatorEnrollments?.value,
    );

    const {
      requiredNow: requiredNowItems,
      requiredSoon: requiredSoonItems,
      ungrouped,
    } = partitionGroupedEnrollButtons(allButtons, groups as AuthenticatorGroup[], languageTags);

    // Route ungrouped buttons through the legacy per-button gracePeriod split.
    // isAuthenticatorButtonInGracePeriod reads the post-processed description
    // fields on options (which are only populated when the GP is active) rather
    // than trying to re-parse the locale-formatted gracePeriodExpiry string.
    ungrouped.forEach((btn) => {
      const soon = isAuthenticatorButtonInGracePeriod(btn);
      (soon ? requiredSoonItems : requiredNowItems).push({ kind: 'bare', button: btn });
    });

    const elements: UISchemaElement[] = [title, description];

    if (requiredNowItems.length > 0) {
      elements.push(buildRequiredNowHeading());
      elements.push(...sectionElements(requiredNowItems, 'authenticator-enroll-list'));
    }
    if (requiredSoonItems.length > 0) {
      elements.push(buildRequiredSoonHeading());
      elements.push(buildRequiredSoonDescription());
      const customLink = buildCustomLink(widgetProps);
      if (customLink) { elements.push(customLink); }
      elements.push(...sectionElements(requiredSoonItems, 'authenticator-enroll-list-grace-period'));
    }

    if (skipStep) {
      // In the required-phase group path, the backend only emits `skip` when
      // some group's grace period has budget. Always surface RemindMeLater to
      // match the legacy grace-period skip labelling and stay consistent with
      // the v2 container.
      const remindMeLater: ButtonElement = {
        type: 'Button',
        label: loc('oie.setup.remind.me.later', 'login'),
        options: {
          type: ButtonType.SUBMIT,
          step: 'skip',
        },
      };
      elements.push(remindMeLater);
    }

    uischema.elements = elements;
    return formBag;
  }

  // ---- Legacy path (unchanged) --------------------------------------------
  const authenticatorsWithGracePeriod: IdxOption[] = [];
  const authenticatorsDueNow: IdxOption[] = [];
  authenticator.options.forEach((option) => {
    // @ts-ignore TODO: Add grace period fields to auth-js SDK https://oktainc.atlassian.net/browse/OKTA-848910
    const hasActiveGracePeriodExpiry = option.relatesTo?.gracePeriod?.expiry
      // @ts-ignore TODO: Add grace period fields to auth-js SDK https://oktainc.atlassian.net/browse/OKTA-848910
      && isGracePeriodExpiryStillActive(option.relatesTo?.gracePeriod?.expiry);
    // @ts-ignore TODO: Add grace period fields to auth-js SDK https://oktainc.atlassian.net/browse/OKTA-848910
    const hasActiveRemainingSkips = option.relatesTo?.gracePeriod?.remainingSkips
      // @ts-ignore TODO: Add grace period fields to auth-js SDK https://oktainc.atlassian.net/browse/OKTA-848910
      && option.relatesTo?.gracePeriod?.remainingSkips > 0;
    if (hasActiveGracePeriodExpiry || hasActiveRemainingSkips) {
      authenticatorsWithGracePeriod.push(option);
    } else {
      authenticatorsDueNow.push(option);
    }
  });

  const authenticatorButtonsWithGracePeriod = getAuthenticatorEnrollButtonElements(
    authenticatorsWithGracePeriod,
    stepName as string,
    languageTags,
    authenticatorEnrollments?.value,
  );

  const authenticatorButtonsDueNow = getAuthenticatorEnrollButtonElements(
    authenticatorsDueNow,
    stepName as string,
    languageTags,
    authenticatorEnrollments?.value,
  );

  const headingRequiredNow = buildRequiredNowHeading();
  const headingRequiredSoon = buildRequiredSoonHeading();
  const headingNoGracePeriod: HeadingElement = {
    type: 'Heading',
    options: {
      content: skipStep ? loc('oie.setup.optional.short', 'login') : loc('oie.setup.required.now', 'login'),
      level: 2,
      visualLevel: 6,
    },
  };
  const descriptionGracePeriod = buildRequiredSoonDescription();
  const gracePeriodRequiredSoonCustomLink = buildCustomLink(widgetProps);

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

  const elements: UISchemaElement[] = [title, description];
  if (authenticatorListElementDueNow.length && authenticatorListElementWithGracePeriod.length) {
    elements.push(
      headingRequiredNow,
      ...authenticatorListElementDueNow,
      headingRequiredSoon,
      descriptionGracePeriod,
      ...(gracePeriodRequiredSoonCustomLink ? [gracePeriodRequiredSoonCustomLink] : []),
      ...authenticatorListElementWithGracePeriod,
    );
  } else if (authenticatorListElementWithGracePeriod.length) {
    elements.push(
      headingRequiredSoon,
      descriptionGracePeriod,
      ...(gracePeriodRequiredSoonCustomLink ? [gracePeriodRequiredSoonCustomLink] : []),
      ...authenticatorListElementWithGracePeriod,
    );
  } else {
    elements.push(
      headingNoGracePeriod,
      ...authenticatorListElementDueNow,
    );
  }
  if (skipStep) {
    elements.push(skipButton);
  }

  uischema.elements = elements;

  return formBag;
};
