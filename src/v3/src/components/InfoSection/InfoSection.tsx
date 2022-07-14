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

import { Alert, Box } from '@mui/material';
import { IdxMessage } from '@okta/okta-auth-js';
import { FunctionComponent, h } from 'preact';

import { CUSTOM_MESSAGE_KEYS, IDX_STEP } from '../../constants';
import { useWidgetContext } from '../../contexts';
import { useTranslation } from '../../lib/okta-i18n';
import { MessageType, MessageTypeVariant } from '../../types';

type Props = {
  messages?: IdxMessage[];
};

const EXCLUDE_MESSAGE_STEPS = [IDX_STEP.REENROLL_AUTHENTICATOR_WARNING];

const InfoSection: FunctionComponent<Props> = ({ messages }) => {
  const { t, i18n } = useTranslation();
  const standardMessages = messages?.filter((message) => !CUSTOM_MESSAGE_KEYS.includes(
    message?.i18n?.key,
  ));
  const { idxTransaction } = useWidgetContext();
  const shouldExcludeMessage = idxTransaction?.nextStep?.name
    && EXCLUDE_MESSAGE_STEPS.includes(idxTransaction.nextStep.name);

  return (!shouldExcludeMessage && standardMessages?.length) ? (
    <Box
      marginBottom={4}
      width={1}
    >
      {
        standardMessages.map((message) => (
          <Alert
            key={message.i18n?.key || message.message}
            severity={MessageTypeVariant[message.class as MessageType] ?? MessageTypeVariant.INFO}
            variant="infobox"
          >
            {i18n.exists(message.i18n?.key)
              ? t(message.i18n.key, message.i18n.params)
              : message.message}
          </Alert>
        ))
      }
    </Box>
  ) : null;
};

export default InfoSection;
