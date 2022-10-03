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
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import {
  InfoboxElement,
  MessageType,
  MessageTypeVariant,
  UISchemaElementComponent,
} from '../../types';

const InfoBox: UISchemaElementComponent<{
  uischema: InfoboxElement
}> = ({ uischema }) => {
  const {
    loading,
  } = useWidgetContext();

  const {
    options: {
      message,
      title,
      class: messageClass,
      dataSe,
    },
  } = uischema;

  return !loading ? (
    <Box
      marginBottom={4}
      width={1}
      data-se="message"
    >
      <Alert
        severity={MessageTypeVariant[messageClass as MessageType] ?? MessageTypeVariant.INFO}
        variant="infobox"
        title={title}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(dataSe && { 'data-se': dataSe })}
      >
        {message}
      </Alert>
    </Box>
  ) : null;
};

export default InfoBox;
