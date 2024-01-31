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

import { Box } from '@mui/material';
import { Callout, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { IdxMessage } from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';

import { MessageType, MessageTypeVariant } from '../../types';

type Props = {
  message?: IdxMessage;
};

const InfoSection: FunctionComponent<Props> = ({ message }) => {
  const tokens = useOdysseyDesignTokens();

  return (message ? (
    <Box
      marginBlockEnd={tokens.Spacing4}
      width={1}
    >
      <Callout
        key={message.i18n?.key || message.message}
        severity={MessageTypeVariant[message.class as MessageType] ?? MessageTypeVariant.INFO}
        // visually-hidden severity text is not translated
        translate="no"
      >
        {message.message}
      </Callout>
    </Box>
  ) : null);
};

export default InfoSection;
