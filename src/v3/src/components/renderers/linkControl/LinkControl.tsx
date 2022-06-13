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

import { CellProps } from '@jsonforms/core';
import { Box, Link } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';

import { useWidgetContext } from '../../../contexts';
import { ClickHandler } from '../../../types';
import { buildPayload } from '../../../util';
import { getLabelName } from '../helpers';

const LinkControl: FunctionComponent<CellProps> = (props) => {
  const { uischema: { options }, visible } = props;
  const { t } = useTranslation();
  const { setIdxTransaction, data, formBag } = useWidgetContext();

  const label = t(getLabelName(options?.label));

  const onClick: ClickHandler = async (e) => {
    e.preventDefault();

    const payload = buildPayload(formBag, options?.idxMethodParams ?? data);
    const transaction = await options?.action?.(payload);
    setIdxTransaction(transaction);
  };

  return visible ? (
    // @ts-ignore OKTA-471233
    <Box marginTop="m">
      {
        options?.action !== undefined ? (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <Link
            // eslint-disable-next-line no-script-url
            href="javascript:void(0)"
            onClick={onClick}
          >
            {label}
          </Link>
        ) : <Link href={options?.href}>{label}</Link>
      }
    </Box>
  ) : null;
};

export default LinkControl;
