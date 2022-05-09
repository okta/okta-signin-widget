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

import { ControlProps } from '@jsonforms/core';
import { Box, Text } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';
import { ImageWithTextElement } from 'src/types';

const ImageWithTextControl: FunctionComponent<ControlProps> = (props) => {
  const { t } = useTranslation();
  const { uischema, visible } = props;
  const element = uischema as ImageWithTextElement;
  const Icon = element.options.SVGIcon;

  return (visible ? (
    // @ts-ignore OKTA-471233
    <Box
      id={element.scope}
      display="flex"
      justifyContent="flex-start"
      alignItems="center"
      flexWrap="wrap"
      marginBottom="m"
    >
      {/* @ts-ignore OKTA-471233 */}
      <Box marginRight="s">
        <Icon />
      </Box>
      {/* @ts-ignore OKTA-471233 */}
      <Box>
        <Text as="span">{t(element.options.textContent)}</Text>
      </Box>
    </Box>
  ) : null);
};

export default ImageWithTextControl;
