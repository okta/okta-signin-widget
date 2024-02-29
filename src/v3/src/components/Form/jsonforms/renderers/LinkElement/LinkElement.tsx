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

// TODO: OKTA-564568 Link exported from ODY does not have the focus() function and breaks autofocus
import { RendererProps } from '@jsonforms/core';
import { withJsonFormsRendererProps } from '@jsonforms/react';
import { Box, Link as LinkMui } from '@mui/material';
import { FunctionComponent, h } from 'preact';

import { useAutoFocus } from '../../../../../hooks';
import { ActionEvent } from '../../../../../types';

const LinkElement: FunctionComponent<RendererProps> = ({ uischema }) => {
  const {
    options: {
      focus,
      id,
      label,
      target,
      event,
    } = {},
  } = uischema;
  const focusRef = useAutoFocus<HTMLAnchorElement>(focus);

  return (
    <Box marginBlockEnd={4}>
      <LinkMui
        href={target.value}
        ref={focusRef}
        data-se={id}
        target={event === ActionEvent.REDIRECT_BLANK && '_blank'}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(event === ActionEvent.REDIRECT_BLANK && { rel: 'noopener noreferrer' })}
      >
        {label.content.text}
      </LinkMui>
    </Box>
  );
};

export default withJsonFormsRendererProps(LinkElement);
