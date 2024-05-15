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

import { RendererProps } from '@jsonforms/core';
import { withJsonFormsRendererProps } from '@jsonforms/react';
import { Box, Link as LinkMui } from '@mui/material';
import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus, useOnSubmit } from '../../../../../hooks';
import { ClickHandler } from '../../../../../types';

const LinkButtonElement: FunctionComponent<RendererProps> = ({ uischema }) => {
  const widgetContext = useWidgetContext();
  const tokens = useOdysseyDesignTokens();
  const {
    loading,
  } = widgetContext;
  const {
    options: {
      /** Not currently used */
      focus,
      onClick: onClickHandler,
      /** END */
      id,
      label,
      isActionStep,
      step,
      events,
    } = {},
  } = uischema;
  const onSubmitHandler = useOnSubmit();
  const focusRef = useAutoFocus<HTMLAnchorElement>(focus);

  const onClick: ClickHandler = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (typeof onClickHandler !== 'undefined') {
      onClickHandler(widgetContext);
      return;
    }

    onSubmitHandler({
      params: events?.[0]?.action?.actionParams,
      includeData: events?.[0]?.action?.includeFormData,
      step: step,
      isActionStep,
    });
  };

  return (
    <Box sx={{marginBlockEnd: tokens.Spacing3}}>
      <LinkMui
        component="button"
        role="link"
        onClick={onClick}
        ref={focusRef}
        data-se={id}
      >
        {label}
      </LinkMui>
    </Box>
  );
};

export default withJsonFormsRendererProps(LinkButtonElement);
