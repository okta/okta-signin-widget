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
  Box, QuestionCircleIcon, Tooltip, Typography,
} from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useHtmlContentParser } from '../../hooks';
import { DescriptionElement, UISchemaElementComponent } from '../../types';

const InformationalText: UISchemaElementComponent<{
  uischema: DescriptionElement
}> = ({
  uischema,
}) => {
  const { content, dataSe, tooltip } = uischema.options;
  const parsedContent = useHtmlContentParser(content, uischema.parserOptions);

  return (
    <Box
      display="flex"
      justifyContent="flex-start"
    >
      <Typography
        id={uischema.id}
        paragraph
        data-se={dataSe || 'o-form-explain'}
        className={uischema.noTranslate ? 'no-translate' : undefined}
      >
        {parsedContent}
      </Typography>
      {tooltip && (
        <Tooltip
          describeChild
          placement="top"
          title={tooltip}
        >
          <QuestionCircleIcon />
        </Tooltip>
      )}
    </Box>
  );
};

export default InformationalText;
