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

import { Box, FormHelperText } from '@mui/material';
import { FunctionComponent, h } from 'preact';

import { WidgetMessage } from '../../types';
import { buildErrorMessageIds } from '../../util';
import WidgetMessageContainer from '../WidgetMessageContainer';

type FieldLevelMessageProps = {
  messages?: WidgetMessage[];
  fieldName: string;
};

const FieldLevelMessageContainer: FunctionComponent<FieldLevelMessageProps> = (props) => {
  const { fieldName, messages } = props;

  const buildElementId = (errorIndex: number): string => {
    if (typeof messages === 'undefined') {
      return `${fieldName}-error`;
    }
    const errorIdStr = buildErrorMessageIds(messages, fieldName);
    return errorIdStr.split(' ')[errorIndex];
  };

  return typeof messages !== 'undefined' ? (
    <Box>
      {messages.map((message: WidgetMessage, index: number) => (
        <FormHelperText
          key={message}
          id={buildElementId(index)}
          role="alert"
          data-se={buildElementId(index)}
          error
          // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
          sx={{ textAlign: 'start' }}
        >
          <WidgetMessageContainer message={message} />
        </FormHelperText>
      ))}
    </Box>
  ) : null;
};

export default FieldLevelMessageContainer;
