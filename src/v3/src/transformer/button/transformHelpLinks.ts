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

import { STEPS_REQUIRING_HELP_LINK } from '../../constants';
import {
  CustomLink,
  LinkElement,
  TransformStepFnWithOptions,
} from '../../types';
import { getCustomHelpLinks, getHelpLink, loc } from '../../util';

export const transformHelpLinks: TransformStepFnWithOptions = ({
  transaction,
  widgetProps,
}) => (
  formbag,
) => {
  const shouldAddButton = transaction.availableSteps
    ?.some(({ name }) => STEPS_REQUIRING_HELP_LINK.includes(name));
  if (!shouldAddButton) {
    return formbag;
  }

  const helpLinkHref = getHelpLink(widgetProps);
  const helpLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      href: helpLinkHref,
      step: '',
      label: loc('help', 'login'),
      dataSe: 'help',
    },
  };

  const transformCustomLink: (link: CustomLink) => LinkElement = ({ href, text, target }) => ({
    type: 'Link',
    contentType: 'footer',
    options: {
      href,
      target,
      step: '',
      label: text,
      dataSe: 'custom',
    },
  });
  const customHelpLinks = getCustomHelpLinks(widgetProps).map(transformCustomLink);

  const helpLinks = [
    helpLink,
    ...customHelpLinks,
  ];
  formbag.uischema.elements.push(...helpLinks);

  return formbag;
};
