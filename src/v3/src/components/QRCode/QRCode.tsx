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

import * as Tokens from '@okta/odyssey-design-tokens';
import { Box } from '@okta/odyssey-react-mui-legacy';
import { h } from 'preact';

import { QRCodeElement, UISchemaElementComponent } from '../../types';
import { getTranslation } from '../../util';

const QRCode: UISchemaElementComponent<{
  uischema: QRCodeElement
}> = ({
  uischema,
}) => {
  const { translations = [], options: { data } } = uischema;
  const label = getTranslation(translations, 'label');
  return (
    <Box
      className="qrContainer"
      sx={(theme) => ({
        marginBlockStart: theme.spacing(4),
        marginBlockEnd: theme.spacing(4),
        marginInlineStart: theme.spacing(0),
        marginInlineEnd: theme.spacing(0),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      })}
    >
      <Box
        as="img"
        className="qrImg"
        sx={{
          width: '224px',
          height: '224px',
          borderWidth: Tokens.BorderWidthBase,
          borderStyle: Tokens.BorderStyleBase,
          borderColor: Tokens.ColorBorderDisplay,
          borderRadius: Tokens.BorderRadiusBase,
        }}
        src={data}
        alt={label}
      />
    </Box>
  );
};

export default QRCode;
