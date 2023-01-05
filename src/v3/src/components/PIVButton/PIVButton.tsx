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

import { CircularProgress } from '@mui/material';
import { Box, Button as OdyButton } from '@okta/odyssey-react-mui';
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

const PIVButton: UISchemaElementComponent<{
  uischema: PIVButtonElement
}> = ({ uischema }) => {
  const { translations = [], ariaDescribedBy } = uischema;

  const btnLabel = getTranslation(translations, 'label');

  const { setMessage, loading, idxTransaction } = useWidgetContext();
  const [waiting, setWaiting] = useState<boolean>(false);

  const showLoading = waiting || loading;

  const initCertPrompt = () => {
    setWaiting(true);
    setMessage(undefined);

    Util.redirectWithFormGet(idxTransaction?.nextStep?.href);
  };

  const handleClick: ClickHandler = (event) => {
    event?.preventDefault();
    initCertPrompt();
  };

  useEffect(() => {
    initCertPrompt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      marginBottom={4}
      display={showLoading ? 'flex' : undefined}
      justifyContent={showLoading ? 'center' : undefined}
    >
      {
        showLoading
          ? (
            <CircularProgress
              id="okta-spinner"
              data-se="okta-spinner"
              // TODO: OKTA-518793 - replace english string with key once created
              aria-label="Loading..."
              aria-valuetext="Loading..."
            />
          )
          : (
            <OdyButton
              data-se="button"
              onClick={handleClick}
              variant="primary"
              aria-describedby={ariaDescribedBy}
              wide
            >
              { btnLabel }
            </OdyButton>
          )
      }
    </Box>
  );
};

export default PIVButton;
