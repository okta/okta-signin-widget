/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Typography } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { loc, parseHtmlContent } from '../../util';
import {
  OKTA_MASTER_SUBSCRIPTION_AGREEMENT_URL,
  OKTA_PRIVACY_POLICY_URL,
} from './constants';

type FeedbackLegalTextProps = {
  /** i18n key for the legal sentence; must use a <$1> emphasis token and <$2>/<$3> link tokens. */
  i18nKey: string;
};

/**
 * Renders the feedback consent sentence with the "Send feedback" button name
 * emphasized (<$1>) and the Okta Privacy Policy (<$2>) / Master Subscription
 * Agreement (<$3>) as links.
 */
export const FeedbackLegalText = ({ i18nKey }: FeedbackLegalTextProps): h.JSX.Element => {
  const content = loc(i18nKey, 'login', undefined, {
    $1: { element: 'span', attributes: { class: 'strong' } },
    $2: {
      element: 'a',
      attributes: { href: OKTA_PRIVACY_POLICY_URL, target: '_blank', rel: 'noopener noreferrer' },
    },
    $3: {
      element: 'a',
      attributes: { href: OKTA_MASTER_SUBSCRIPTION_AGREEMENT_URL, target: '_blank', rel: 'noopener noreferrer' },
    },
  });

  return (
    <Typography
      component="p"
      variant="body"
    >
      {parseHtmlContent(content)}
    </Typography>
  );
};
