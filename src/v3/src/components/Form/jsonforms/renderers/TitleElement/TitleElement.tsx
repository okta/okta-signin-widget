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

import { LabelProps } from '@jsonforms/core';
import { withJsonFormsLabelProps } from '@jsonforms/react';
import { Box } from '@mui/material';
import { Typography, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { useWidgetContext } from '../../../../../contexts';
import { toFlexAlignItems, toFlexJustifyContent } from '../../../../../util';

const TitleElement: FunctionComponent<LabelProps & { i18n?: string }> = (
  { uischema, text /* ,  i18n */ },
) => {
  const {
    options: { alignment, id, focus } = {},
  } = uischema;
  const titleRef = useRef<HTMLTitleElement>(null);
  const { widgetProps } = useWidgetContext();
  const tokens = useOdysseyDesignTokens();
  const { features: { autoFocus = false } = {} } = widgetProps;

  useEffect(() => {
    if (!autoFocus && focus && titleRef.current) {
      titleRef.current?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      id={id}
      display="flex"
      justifyContent={toFlexJustifyContent(alignment)}
      alignItems={toFlexAlignItems(alignment)}
      sx={{marginBlockEnd: tokens.Spacing3}}
    >
      <Typography
        testId="o-form-head"
        component="h2"
        variant="h4"
        ref={titleRef}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default withJsonFormsLabelProps(TitleElement);
