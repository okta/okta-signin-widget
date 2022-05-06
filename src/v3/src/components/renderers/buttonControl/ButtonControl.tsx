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
  and, ControlProps, optionIs, or, rankWith,
} from '@jsonforms/core';
import { Box, Button } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';
import { ClickHandler, IdxMethod, JsonObject } from 'src/types';

import { ButtonOptionType } from '../../../transformer/getButtonControls';

const ButtonControl: FunctionComponent<ControlProps> = ({
  uischema, config, label, visible,
}) => {
  const { t } = useTranslation();

  const { proceed, reset } = config;
  const type = uischema.options?.type as ButtonOptionType;
  const newIdxMethodName = uischema.options?.idxMethod as IdxMethod | undefined;
  const params = uischema.options?.idxMethodParams as JsonObject | undefined;

  const onClick: ClickHandler = (e) => {
    e.preventDefault();
    switch (type) {
      case ButtonOptionType.CANCEL: {
        reset();
        break;
      }
      case ButtonOptionType.SUBMIT: {
        proceed({ newIdxMethodName, params });
        break;
      }
      case ButtonOptionType.REGISTER: {
        reset('register');
        break;
      }
      case ButtonOptionType.FORGOT_PASSWORD: {
        reset('recoverPassword');
        break;
      }
      case ButtonOptionType.UNLOCK_ACCOUNT: {
        reset('unlockAccount');
        break;
      }
      default:
        proceed({ newIdxMethodName: 'authenticate' });
        break;
    }
  };

  return visible ? (
    // @ts-ignore OKTA-471233
    <Box marginTop="m">
      <Button
        data-testid={uischema.scope}
        size="m"
        onClick={onClick}
        variant={uischema.options?.variant ?? 'primary'}
        wide
      >
        {typeof label === 'string' ? t(label) : t('oie.registration.form.update.submit')}
      </Button>
    </Box>
  ) : null;
};

export const buttonControlTester = rankWith(
  9,
  and(
    optionIs('format', 'button'),
    or(
      optionIs('type', 'submit'),
      optionIs('type', 'cancel'),
      optionIs('type', 'register'),
      optionIs('type', 'forgotPassword'),
      optionIs('type', 'unlockAccount'),
    ),
  ),
);

export default ButtonControl;
