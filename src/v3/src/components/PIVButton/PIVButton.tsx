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
import { Button as OdyButton, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import Util from '../../../../util/Util';
import { useWidgetContext } from '../../contexts';
import {
  ClickHandler,
  PIVButtonElement,
  UISchemaElementComponent,
} from '../../types';
import { getTranslation } from '../../util';
import Spinner from '../Spinner';

const PIVButton: UISchemaElementComponent<{
  uischema: PIVButtonElement
}> = ({ uischema }) => {
  const { translations = [], ariaDescribedBy } = uischema;

  const btnLabel = getTranslation(translations, 'label');

  const { setMessage, loading, idxTransaction } = useWidgetContext();
  const { messages, nextStep } = idxTransaction || {};
  const [waiting, setWaiting] = useState<boolean>(false);

  const showLoading = waiting || loading;

  const tokens = useOdysseyDesignTokens();

  const initCertPrompt = () => {
    setWaiting(true);
    setMessage(undefined);

    Util.redirectWithFormGet(nextStep?.href);
  };

  const handleClick: ClickHandler = (event) => {
    event?.preventDefault();
    initCertPrompt();
  };

  useEffect(() => {
    // If messages exists, assume an error and display button (do not auto trigger)
    if (messages?.length) {
      setWaiting(false);
      return;
    }
    initCertPrompt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      marginBlockEnd={tokens.Spacing4}
      display={showLoading ? 'flex' : undefined}
      justifyContent={showLoading ? 'center' : undefined}
    >
      {
        showLoading
          ? <Spinner dataSe="okta-spinner" />
          : (
            <OdyButton
              label={btnLabel || ''}
              testId="button"
              onClick={handleClick}
              variant="primary"
              ariaDescribedBy={ariaDescribedBy}
              isFullWidth
            />
          )
      }
    </Box>
  );
};

export default PIVButton;
