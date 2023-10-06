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

import { Box, CircularProgress } from '@mui/material';
import { FunctionComponent, h } from 'preact';

import { SpinnerElement } from '../../types';
import { loc } from '../../util';

type SpinnerProps = { dataSe?: string; color?: string; };
const Spinner: FunctionComponent<SpinnerProps | SpinnerElement> = (
  props,
) => {
  const { dataSe = undefined, color = undefined } = 'type' in props
    ? {}
    : props as SpinnerProps;
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <CircularProgress
        id={dataSe}
        data-se={dataSe}
        // Using loc here because this component is not only used by transformers
        // but also directly in widget component
        aria-label={loc('processing.alt.text', 'login')}
        aria-valuetext={loc('processing.alt.text', 'login')}
        sx={{ color }}
      />
    </Box>
  );
};

export default Spinner;
