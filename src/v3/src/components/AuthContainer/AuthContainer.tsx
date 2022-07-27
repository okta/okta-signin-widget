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
import useMediaQuery from '@mui/material/useMediaQuery';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';

import style from './style.css';

const AuthContainer: FunctionComponent = ({ children }) => {
  const classes = classNames('auth-container', 'main-container', style.mainViewContainer);
  const borderMatches = useMediaQuery('screen and (max-width: 391px)');
  return (
    <Box
      component="main"
      display="flex"
      justifyContent="center"
      alignItems="center"
      className={classes}
    >
      <Box
        flex="auto"
        flexDirection="column"
        border={borderMatches ? 0 : 1}
        borderRadius={1}
        borderColor="grey.200"
        bgcolor="common.white"
        fontFamily="fontFamily"
        className={style.siwContainer}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthContainer;
