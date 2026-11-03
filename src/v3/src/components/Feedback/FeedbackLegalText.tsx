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

import { Link as OdyLink, Typography } from '@okta/odyssey-react-mui';
import { Fragment, h } from 'preact';

import { loc } from '../../util';
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
 * emphasized and the Okta Privacy Policy / Master Subscription Agreement as real
 * Odyssey links. The source string embeds three tokens, numbered in reading
 * order (the SIW convention):
 *   <$1>…</$1>  emphasized button name ("Send feedback")
 *   <$2>…</$2>  Privacy Policy link text
 *   <$3>…</$3>  Master Subscription Agreement link text
 * We split on those tokens rather than inject HTML, so no dangerouslySetInnerHTML
 * is needed and the links stay keyboard/screen-reader accessible.
 */
export const FeedbackLegalText = ({ i18nKey }: FeedbackLegalTextProps): h.JSX.Element => {
  const raw = loc(i18nKey, 'login');

  // One regex pass splits the sentence into plain text and the three tokens.
  const tokenRe = /<\$([123])>(.*?)<\/\$\1>/g;
  const parts: Array<h.JSX.Element | string> = [];
  let lastIndex = 0;
  let match = tokenRe.exec(raw);
  let key = 0;
  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push(raw.slice(lastIndex, match.index));
    }
    const [, token, text] = match;
    if (token === '2' || token === '3') {
      const href = token === '2'
        ? OKTA_PRIVACY_POLICY_URL
        : OKTA_MASTER_SUBSCRIPTION_AGREEMENT_URL;
      parts.push(
        <OdyLink
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </OdyLink>,
      );
    } else {
      parts.push(<strong key={key}>{text}</strong>);
    }
    key += 1;
    lastIndex = match.index + match[0].length;
    match = tokenRe.exec(raw);
  }
  if (lastIndex < raw.length) {
    parts.push(raw.slice(lastIndex));
  }

  return (
    <Typography
      component="p"
      variant="body"
    >
      {parts.map((part, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>{part}</Fragment>
      ))}
    </Typography>
  );
};
