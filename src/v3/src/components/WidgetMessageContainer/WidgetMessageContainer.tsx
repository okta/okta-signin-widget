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
import { Box, Link, Typography } from '@okta/odyssey-react-mui';
import { HTMLReactParserOptions } from 'html-react-parser';
import { FunctionComponent, h } from 'preact';

import { useHtmlContentParser } from '../../hooks';
import { WidgetMessage, WidgetMessageLink } from '../../types';

const WidgetMessageContainer: FunctionComponent<{
  message?: WidgetMessage,
  parserOptions?: HTMLReactParserOptions
}> = (props) => {
  const { message, parserOptions } = props;

  const renderTitle = (title: string) => (
    <Typography
      component="h2"
      variant="h6"
    >
      {title}
    </Typography>
  );

  const renderLinks = (links: WidgetMessageLink[]) => (
    <List
      className="custom-links"
      disablePadding
      dense
      sx={{ pl: 4, listStyleType: message.listStyleType ?? 'disc', }}
    >
      {links.map((link) => (
        <ListItem
          sx={{
            paddingLeft: 0,
            display: 'list-item',
          }}
          key={link.url}
        >
          <Link
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="monochrome"
          >
            {link.label}
          </Link>
        </ListItem>
      ))}
    </List>
  );

  const createListMessages = (widgetMsg: WidgetMessage) => (
    <Box marginBlockStart={2}>
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
        sx={{ listStyleType: message.listStyleType ?? 'disc', paddingInlineStart: 4 }}
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

  const parsedContent = useHtmlContentParser(typeof message?.message === 'string' ? message.message : '', parserOptions);
  if (typeof message !== 'undefined') {
    return (
      <Box marginBlockEnd={2}>
        {message.title && renderTitle(message.title)}
        {Array.isArray(message.message) ? createListMessages(message) : <Box>{parsedContent}</Box>}
        {message.links && renderLinks(message.links)}
      </Box>
    );
  }
  return null;
};

export default WidgetMessageContainer;
