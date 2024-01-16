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
import { Box, Typography } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { useHtmlContentParser } from '../../../../../hooks';
import { toFlexAlignItems, toFlexJustifyContent } from '../../../../../util';

const TextElement: FunctionComponent<LabelProps & { i18n?: string }> = ({
  uischema, text, i18n,
}) => {
  const {
    options: { alignment, id, parserOptions = {}, noTranslate, style } = {},
  } = uischema;
  const parsedContent = useHtmlContentParser(text, parserOptions);

  return (
    <Box
      display="flex"
      justifyContent={toFlexJustifyContent(alignment)}
      alignItems={toFlexAlignItems(alignment)}
    >
      <Typography
        id={id}
        paragraph
        data-se={id || 'o-form-explain'}
        className={noTranslate ? 'no-translate' : undefined}
        variant={style ?? 'body1'}
      >
        {parsedContent}
      </Typography>
    </Box>
  );
};

export default withJsonFormsLabelProps(TextElement);
