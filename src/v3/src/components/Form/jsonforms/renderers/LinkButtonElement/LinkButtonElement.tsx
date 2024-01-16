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
import { Box, Link as LinkMui } from '@mui/material';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus, useOnSubmit } from '../../../../../hooks';
import { ClickHandler } from '../../../../../types';
import { RendererProps } from '@jsonforms/core';
import { withJsonFormsRendererProps } from '@jsonforms/react';

const LinkButtonElement: FunctionComponent<RendererProps> = ({ uischema }) => {
  const widgetContext = useWidgetContext();
  const {
    loading,
  } = widgetContext;
  const {
    options: {
      /** Not currently used */
      focus,
      actionParams,
      onClick: onClickHandler,
      /** END */
      id,
      label,
      target,
    } = {},
  } = uischema;
  const onSubmitHandler = useOnSubmit();
  const focusRef = useAutoFocus<HTMLAnchorElement>(focus);
  const ACTION_STEPS = ['currentAuthenticator-recover', 'currentAuthenticatorEnrollment-recover', 'cancel'];

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
      params: actionParams,
      isActionStep: ACTION_STEPS.includes(target.value),
      step: target.value,
    });
  };

  return (
    <Box marginBottom={4}>
      <LinkMui
        component="button"
        // Fixes OKTA-653788 (see comments) - Currently we treat all links as buttons
        type="button"
        variant="body1"
        role="link"
        onClick={onClick}
        ref={focusRef}
        data-se={id}
        sx={{
          '&:hover': {
            cursor: 'pointer',
          },
          verticalAlign: 'baseline',
        }}
      >
        {label.content.text}
      </LinkMui>
    </Box>
  );
};

export default withJsonFormsRendererProps(LinkButtonElement);
