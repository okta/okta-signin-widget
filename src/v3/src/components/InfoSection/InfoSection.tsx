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

import { Alert, Box } from '@okta/odyssey-react-mui-legacy';
import { IdxMessage } from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';

import { MessageType, MessageTypeVariant } from '../../types';

type Props = {
  message?: IdxMessage;
};

const InfoSection: FunctionComponent<Props> = ({ message }) => (message ? (
  <Box
    marginBlockEnd={4}
    width={1}
  >
    <Alert
      key={message.i18n?.key || message.message}
      severity={MessageTypeVariant[message.class as MessageType] ?? MessageTypeVariant.INFO}
      variant="infobox"
    >
      {message.message}
    </Alert>
  </Box>
) : null);

export default InfoSection;
