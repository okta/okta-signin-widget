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

import {
  Box,
  Link as MuiLink,
  List,
  ListItem,
} from '@mui/material';
import { Link, Typography, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { HTMLReactParserOptions } from 'html-react-parser';
import { FunctionComponent, h } from 'preact';
import React from 'preact/compat';

import {
  ClickEvent,
  ListStyleType,
  WidgetMessage,
  WidgetMessageOption,
} from '../../types';
import { parseHtmlContent } from '../../util';

const WidgetMessageContainer: FunctionComponent<{
  message?: WidgetMessage,
  parserOptions?: HTMLReactParserOptions,
  linkVariant?: 'monochrome' | 'default',
}> = (props) => {
  const { message, parserOptions, linkVariant } = props;
  const tokens = useOdysseyDesignTokens();

  const renderTitle = (title?: string) => (title && (
    <Typography
      component="h2"
      variant="h6"
    >
      {title}
    </Typography>
  ));

  const getOptionElement = (option: WidgetMessageOption) => {
    switch (option.type) {
      case 'button':
        return (
          // @ts-expect-error error due to variant type applied, can be ignored
          <MuiLink
            component="button"
            role="link"
            onClick={(event: ClickEvent) => {
              event.preventDefault();
              option.onClick();
            }}
            // @ts-expect-error MUI variant type does not include monochrome but functions appropriately when set
            variant={linkVariant}
            sx={{
              textAlign: 'start',
              fontSize: tokens.TypographySizeBody,
              verticalAlign: 'text-top',
            }}
            data-se={option.dataSe}
          >
            {option.label}
          </MuiLink>
        );
      case 'link':
        return (
          <Link
            href={option.url}
            target="_blank"
            rel="noopener noreferrer"
            variant={linkVariant}
          >
            {option.label}
          </Link>
        );
      default:
      case 'text':
        // Custom error remediation allows admins to define a message without a URL
        return option.label;
    }
  };

  const renderOptions = (
    options?: WidgetMessageOption[],
    listStyleType?: ListStyleType,
  ) => (options && (
    <List
      data-se="custom-options"
      disablePadding
      dense
      sx={{
        pl: listStyleType ? tokens.Spacing4 : tokens.Spacing0,
        listStyle: listStyleType ?? 'none',
      }}
    >
      {options.map((option) => (
        <ListItem
          sx={{
            paddingLeft: 0,
            display: 'list-item',
          }}
          key={option.label}
        >
          {getOptionElement(option)}
        </ListItem>
      ))}
    </List>
  ));

  const createListMessages = (widgetMsg: WidgetMessage) => (
    <Box marginBlockStart={tokens.Spacing2}>
      {
        widgetMsg.description && (
          <Typography
            component="p"
          >
            {widgetMsg.description}
          </Typography>
        )
      }
      <List
        dense
        disablePadding
        sx={{ listStyle: widgetMsg.listStyleType ?? 'disc', paddingInlineStart: tokens.Spacing4 }}
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

  const parsedContent = parseHtmlContent(typeof message?.message === 'string' ? message.message : '', parserOptions);
  if (typeof message !== 'undefined') {
    return (
      <React.Fragment>
        {renderTitle(message.title)}
        {Array.isArray(message.message) ? createListMessages(message) : parsedContent}
        {/* `message.options` is an augmented version of `message.links`, so they are mutually exclusive */}
        {renderOptions(message.options ?? message.links?.map((link) => ({ type: 'link', ...link })), message.listStyleType)}
      </React.Fragment>
    );
  }
  return null;
};

export default WidgetMessageContainer;
