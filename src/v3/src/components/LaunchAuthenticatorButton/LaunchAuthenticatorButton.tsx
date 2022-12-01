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

import { Box, Button as ButtonMui, useTheme } from '@mui/material';
import { h } from 'preact';

import { useOnSubmit } from '../../hooks';
import {
  ClickHandler,
  LaunchAuthenticatorButtonElement,
  UISchemaElementComponent,
} from '../../types';
import { getTranslation } from '../../util';
import { OktaVerifyIcon } from '../Icon';

const LaunchAuthenticatorButton: UISchemaElementComponent<{
  uischema: LaunchAuthenticatorButtonElement
}> = ({ uischema }) => {
  const theme = useTheme();

  const onSubmitHandler = useOnSubmit();
  const {
    translations = [],
    options: {
      step,
    },
  } = uischema;

  const handleClick: ClickHandler = async () => {
    onSubmitHandler({
      step,
    });
  };

  const label = getTranslation(translations, 'label');
  const iconDescription = getTranslation(translations, 'icon-description') || '';

  return (
    <ButtonMui
      variant="secondary"
      fullWidth
      onClick={handleClick}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        alignContent="space-between"
        gap="5px"
        // keep the icon from stretching the button vertically
        marginTop="-4px"
        marginBottom="-5px"
      >
        <OktaVerifyIcon
          name="mfa-okta-verify"
          description={iconDescription}
          width={theme.spacing(5)}
          height={theme.spacing(5)}
        />
        {label}
      </Box>
    </ButtonMui>
  );
};

export default LaunchAuthenticatorButton;
