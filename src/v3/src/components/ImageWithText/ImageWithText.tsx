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

import { Box, Text } from '@okta/odyssey-react';
import { withTheme } from '@okta/odyssey-react-theme';
import { h } from 'preact';
import { ImageWithTextElement, UISchemaElementComponent } from 'src/types';

import { useTranslation } from '../../lib/okta-i18n';
import { theme } from './ImageWithText.theme';
import style from './style.module.css';

const ImageWithText: UISchemaElementComponent<{
  uischema: ImageWithTextElement
}> = ({ uischema }) => {
  const { t } = useTranslation();
  const Icon = uischema.options.SVGIcon;

  return (
    // @ts-ignore OKTA-471233
    <Box
      id={uischema.options.id}
      display="flex"
      justifyContent="flex-start"
      alignItems="center"
      flexWrap="wrap"
    >
      {/* @ts-ignore OKTA-471233 */}
      <Box marginRight="s">
        <Icon />
      </Box>
      {/* @ts-ignore OKTA-471233 */}
      <Box>
        <Text as="span">{t(uischema.options.textContent, uischema.options.contentParams)}</Text>
      </Box>
    </Box>
  );
};

export default withTheme(theme, style)(ImageWithText);
