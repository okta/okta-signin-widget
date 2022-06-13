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
  ControlProps,
  optionIs,
  rankWith,
} from '@jsonforms/core';
import { Box, Button } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';
import { ClickHandler } from 'src/types';

import { useWidgetContext } from '../../../contexts';
import { buildPayload } from '../../../util';

const ButtonControl: FunctionComponent<ControlProps> = ({
  uischema, label, visible,
}) => {
  const { t } = useTranslation();
  const {
    setIdxTransaction,
    data,
    formBag,
    transaction: idxTransaction,
  } = useWidgetContext();

  const onClick: ClickHandler = async (e) => {
    e.preventDefault();

    const payload = buildPayload(formBag, uischema.options?.idxMethodParams ?? data);
    const transaction = await uischema.options?.action?.({
      ...payload,
      stateHandle: idxTransaction?.context.stateHandle,
    });
    setIdxTransaction(transaction);
  };

  return visible ? (
    // @ts-ignore OKTA-471233
    <Box marginTop="m">
      <Button
        data-testid={uischema.scope}
        size="m"
        type={uischema.options?.type || 'button'}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(uischema.options?.type !== 'submit' && { onClick })}
        variant={uischema.options?.variant ?? 'primary'}
        wide
      >
        {typeof label === 'string' ? t(label) : t('oie.registration.form.update.submit')}
      </Button>
    </Box>
  ) : null;
};

export const buttonControlTester = rankWith(
  10,
  optionIs('format', 'button'),
);

export default ButtonControl;
