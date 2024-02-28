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

import { Box } from '@mui/material';
import { Typography, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useHtmlContentParser } from '../../hooks';
import { HeadingElement, UISchemaElementComponent } from '../../types';

const Heading: UISchemaElementComponent<{
  uischema: HeadingElement
}> = ({ uischema }) => {
  const {
    id,
    noTranslate,
    parserOptions,
    noMargin,
    options: {
      content, dataSe, level, visualLevel,
    },
  } = uischema;
  const tokens = useOdysseyDesignTokens();
  const parsedContent = useHtmlContentParser(content, parserOptions);

  return (
    <Box
      display="flex"
      justifyContent="flex-start"
      marginBlockEnd={noMargin ? undefined : tokens.Spacing2}
    >
      <Typography
        variant={`h${visualLevel ?? 2}`}
        component={`h${level ?? 3}`}
        translate={noTranslate ? 'no' : undefined}
        testId={dataSe ?? id}
      >
        {parsedContent}
      </Typography>
    </Box>
  );
};

export default Heading;
