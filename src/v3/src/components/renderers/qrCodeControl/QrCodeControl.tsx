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
import { Box } from '@okta/odyssey-react';
import { withTheme } from '@okta/odyssey-react-theme';
import { FunctionComponent, h } from 'preact';

import { getLabelName } from '../helpers';
import { theme } from './QrCodeControl.theme';
import styles from './styles.module.css';

const QrCodeControl: FunctionComponent<CellProps> = ({
  uischema,
  visible,
}) => (visible ? (
  // @ts-ignore OKTA-471233
  <Box className={styles.qrContainer}>
    <img
      class={styles.qrImg}
      src={uischema.options?.data}
      alt={getLabelName(uischema.options?.label)}
    />
  </Box>
) : null);

export default withTheme(theme, styles)(QrCodeControl);
