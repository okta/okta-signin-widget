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
import { useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { QRCodeElement, UISchemaElementComponent } from '../../types';
import { getTranslation } from '../../util';
import Image from '../Image';

const QRCode: UISchemaElementComponent<{
  uischema: QRCodeElement
}> = ({
  uischema,
}) => {
  const { translations = [], options: { data } } = uischema;
  const label = getTranslation(translations, 'label');
  const tokens = useOdysseyDesignTokens();

  return (
    <Box
      data-se="qrContainer"
      sx={{
        marginBlockStart: tokens.Spacing5,
        marginBlockEnd: tokens.Spacing5,
        marginInlineStart: tokens.Spacing1,
        marginInlineEnd: tokens.Spacing1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          overflow: 'hidden',
          borderWidth: tokens.BorderWidthMain,
          borderStyle: tokens.BorderStyleMain,
          borderColor: tokens.BorderColorDisplay,
          borderRadius: tokens.BorderRadiusMain,
        }}
      >
        <Image
          src={data}
          alt={label ?? ''}
          width="224px"
          height="224px"
          testId="qrImg"
        />
      </Box>
    </Box>
  );
};

export default QRCode;
