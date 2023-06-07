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
import { Box, Typography } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';
import React from 'preact/compat';

import { WidgetMessage } from '../../types';

const WidgetMessageContainer: FunctionComponent<{ message?: WidgetMessage }> = (props) => {
  const { message } = props;

  const createListMessages = (widgetMsg: WidgetMessage) => (
    <Box marginTop={2}>
      {
        widgetMsg.description && (
          <Typography
            component="p"
            fontSize="inherit"
          >
            {widgetMsg.description}
          </Typography>
        )
      }
      <List
        dense
        disablePadding
        sx={{ listStyleType: 'disc', paddingLeft: 4 }}
      >
        {
          (widgetMsg.message as WidgetMessage[])?.map((wm: WidgetMessage) => {
            if (typeof wm.message === 'string') {
              return (
                <ListItem
                  key={wm.message}
                  // TODO: OKTA-577905 - (textAlign: 'start') Temporary fix until we can upgrade to the latest version of Odyssey
                  sx={{ display: 'list-item', textAlign: 'start' }}
                  dense
                  disablePadding
                >
                  {wm.message}
                </ListItem>
              );
            }
            if (Array.isArray(wm.message)) {
              return wm.message.map((msg: WidgetMessage) => (
                <WidgetMessageContainer
                  key={msg}
                  message={msg}
                />
              ));
            }
            return null;
          })
        }
      </List>
    </Box>
  );

  if (typeof message !== 'undefined') {
    return Array.isArray(message.message)
      ? createListMessages(message)
      : <React.Fragment>{message.message}</React.Fragment>;
  }
  return null;
};

export default WidgetMessageContainer;
