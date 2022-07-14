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
import { Icon } from '@okta/odyssey-react';
import { withTheme } from '@okta/odyssey-react-theme';
import classNames from 'classnames';
import { FunctionComponent, h } from 'preact';

import { IDX_STEP } from '../../constants';
import { useWidgetContext } from '../../contexts';
import { Undefinable } from '../../types';
import { theme } from './IdentifierContainer.theme';
import style from './style.module.css';

const shouldHideIdentifier = (
  showIdentifier?: boolean,
  identifier?: string,
  stepName?: string,
): boolean => {
  // Should not display identifier here because if invalid identifier
  // is used, introspect includes the invalid name in user context
  if (stepName === IDX_STEP.IDENTIFY) {
    return true;
  }

  if (showIdentifier === false) {
    return true;
  }

  if (!identifier) {
    return true;
  }

  return false;
};

const IdentifierContainer: FunctionComponent = () => {
  const { widgetProps: { features }, idxTransaction } = useWidgetContext();
  const identifier: Undefinable<string> = idxTransaction
    ?.context?.user?.value?.identifier as string;

  if (shouldHideIdentifier(features?.showIdentifier, identifier, idxTransaction?.nextStep?.name)) {
    return null;
  }

  const mainContainerClasses = classNames('identifier-container');
  const identiferContainerClasses = classNames(style.identifierContainer);
  const identifierSpanClasses = classNames('identifier', style.identifierSpan);
  const iconContainerClasses = classNames(style.userIconContainer);
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      marginBottom={4}
      className={mainContainerClasses}
    >
      <Box
        flex="auto"
        flexDirection="row"
        flexGrow="0"
        paddingX={4}
        paddingY={2}
        className={identiferContainerClasses}
      >
        <Box
          component="span"
          className={iconContainerClasses}
        >
          <Icon name="user" />
        </Box>
        <Box
          component="span"
          className={identifierSpanClasses}
          data-se="identifier"
        >
          {identifier}
        </Box>
      </Box>
    </Box>
  );
};

export default withTheme(theme, style)(IdentifierContainer);
