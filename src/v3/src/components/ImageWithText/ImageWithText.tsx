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

import './style.module.css';

import { Box } from '@mui/material';
import { Text } from '@okta/odyssey-react';
import { h } from 'preact';
import { ImageWithTextElement, UISchemaElementComponent } from 'src/types';

const ImageWithText: UISchemaElementComponent<{
  uischema: ImageWithTextElement
}> = ({ uischema }) => {
  const Icon = uischema.options.SVGIcon;
  const { textContent, alignment = 'flex-start' } = uischema.options;

  return (
    <Box
      id={uischema.options.id}
      display="flex"
      justifyContent={alignment}
      alignItems="center"
      flexWrap="wrap"
      sx={(theme) => ({
        '--PrimaryFill': theme.palette.primary.main,
        '--PrimaryDarkFill': theme.palette.primary.dark,
        '--SecondaryFill': theme.palette.primary.light,
      })}
    >
      <Box marginRight={2}>
        <Icon />
      </Box>
      {
        textContent
        && (
        <Box>
          <Text as="span">{textContent}</Text>
        </Box>
        )
      }
    </Box>
  );
};

export default ImageWithText;
