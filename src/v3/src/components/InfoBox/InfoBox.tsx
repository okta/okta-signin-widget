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
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import {
  InfoboxElement,
  MessageType,
  MessageTypeVariant,
  UISchemaElementComponent,
} from '../../types';
import { getLinkReplacerFn } from '../../util';
import WidgetMessageContainer from '../WidgetMessageContainer';

const InfoBox: UISchemaElementComponent<{
  uischema: InfoboxElement
}> = ({ uischema }) => {
  const {
    loading,
  } = useWidgetContext();

  const {
    options: {
      message,
      class: messageClass,
      dataSe,
    },
  } = uischema;

  const tokens = useOdysseyDesignTokens();

  return loading ? null : (
    <Box
      marginBlockEnd={tokens.Spacing4}
      width={1}
      data-se={`infobox-${messageClass.toLowerCase()}`}
    >
      <Callout
        severity={MessageTypeVariant[messageClass as MessageType] ?? MessageTypeVariant.INFO}
        testId={dataSe}
        // visually-hidden severity text is not translated
        translate="no"
      >
        {
          Array.isArray(message)
            ? message.map((msg) => (
              <Box
                marginBlockEnd={tokens.Spacing2}
                key={msg.message}
              >
                <WidgetMessageContainer
                  key={msg.message}
                  message={msg}
                  parserOptions={{ replace: getLinkReplacerFn({}, 'monochrome') }}
                  linkVariant="monochrome"
                />
              </Box>
            ))
            : (
              <WidgetMessageContainer
                message={message}
                linkVariant="monochrome"
              />
            )
        }
      </Callout>
    </Box>
  );
};

export default InfoBox;
