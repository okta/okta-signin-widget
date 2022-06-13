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

import { Box, Infobox } from '@okta/odyssey-react';
import { IdxMessage } from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';

import { CUSTOM_MESSAGE_KEYS } from '../../constants';
import { MessageType, MessageTypeVariant } from '../../types';

type Props = {
  messages?: IdxMessage[];
};

const InfoSection: FunctionComponent<Props> = ({ messages }) => {
  const standardMessages = messages?.filter(({ i18n }) => !CUSTOM_MESSAGE_KEYS.includes(i18n?.key));

  return standardMessages?.length ? (
    // @ts-ignore OKTA-471233
    <Box
      marginBottom="m"
      width="full"
    >
      {
        standardMessages.map((message) => (
          <Infobox
            key={message.message}
            variant={MessageTypeVariant[message.class as MessageType] ?? MessageTypeVariant.INFO}
            content={message.message}
          />
        ))
      }
    </Box>
  ) : null;
};

export default InfoSection;
