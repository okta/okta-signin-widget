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

import { List, ListItem } from '@mui/material';
import { Box, FormHelperText, Typography } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { WidgetMessage } from '../../types';
import { buildErrorMessageIds } from '../../util';

type FieldErrorProps = {
  errors: WidgetMessage[];
  fieldName: string;
};

const WidgetMessageContainer: FunctionComponent<FieldErrorProps> = (props) => {
  const { fieldName, errors } = props;

  const buildElementId = (errorIndex: number): string => {
    const errorIdStr = buildErrorMessageIds(errors, fieldName);
    return errorIdStr.split(' ')[errorIndex];
  };

  const createListMessages = (error: WidgetMessage) => {
    if (error.type !== 'list') {
      return null;
    }
    return (
      <Box
        marginBlockStart={2}
        sx={(theme) => ({
          color: theme.palette.error.main,
          fontSize: theme.typography.caption.fontSize,
        })}
      >
        {
          error.description && (
            <Typography
              component="p"
              fontSize={(theme) => theme.typography.caption.fontSize}
            >
              {error.description}
            </Typography>
          )
        }
        <List
          dense
          disablePadding
          sx={{ listStyleType: 'disc', paddingInlineStart: 4 }}
        >
          {
            error.messages.map((message: WidgetMessage) => {
              if (message.type === 'string') {
                return (
                  <ListItem
                    key={message.message}
                    sx={{ display: 'list-item' }}
                    dense
                    disablePadding
                  >
                    {message.message}
                  </ListItem>
                );
              }
              if (message.type === 'list') {
                return (
                  <WidgetMessageContainer
                    errors={message.messages}
                    fieldName={fieldName}
                  />
                );
              }
              return null;
            })
          }
        </List>
      </Box>
    );
  };

  return (
    <Box>
      {
        errors.map((error: WidgetMessage, index: number) => {
          if (error.type === 'list') {
            return createListMessages(error);
          }
          if (error.type === 'string') {
            return (
              <FormHelperText
                key={error.message}
                id={buildElementId(index)}
                role="alert"
                data-se={buildElementId(index)}
                error
                // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
                sx={{ textAlign: 'start' }}
              >
                {error.message}
              </FormHelperText>
            );
          }
          return null;
        })
      }
    </Box>
  );
};

export default WidgetMessageContainer;
