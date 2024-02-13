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
import { Button, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { IdxActionParams } from '@okta/okta-auth-js';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { getMessageFromBrowserError } from '../../../../v2/ion/i18nUtils';
import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import {
  ClickHandler,
  UISchemaElementComponent,
  WebAuthNButtonElement,
} from '../../types';
import { getTranslation } from '../../util';

const WebAuthNSubmit: UISchemaElementComponent<{
  uischema: WebAuthNButtonElement
}> = ({ uischema }) => {
  const { translations = [], ariaDescribedBy } = uischema;
  const { options } = uischema;

  const btnLabel = getTranslation(translations, 'label');
  const btnRetryLabel = getTranslation(translations, 'retry-label');

  const tokens = useOdysseyDesignTokens();
  const { setMessage, loading } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const [waiting, setWaiting] = useState<boolean>(false);
  const [label, setLabel] = useState<string>(btnLabel!);

  const showLoading = waiting || loading;

  const executeNextStep = () => {
    setWaiting(true);
    setMessage(undefined);

    options.onClick()
      .then(async (params: IdxActionParams) => {
        setMessage(undefined);
        onSubmitHandler({
          params,
          step: options.step,
          includeData: true,
        });
      })
      .catch((error: Error) => {
        const message = getMessageFromBrowserError(error);
        setMessage({
          message,
          class: 'ERROR',
          i18n: { key: message },
        });
        if (btnRetryLabel) {
          setLabel(btnRetryLabel);
        }
      })
      .finally(() => setWaiting(false));
  };

  const handleClick: ClickHandler = (event) => {
    event?.preventDefault();
    executeNextStep();
  };

  // FIXME Change this to use hook instead
  // see: https://github.com/okta/siw-next/pull/67#discussion_r817894228
  useEffect(() => {
    if (options?.submitOnLoad) {
      executeNextStep();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      marginBlockEnd={tokens.Spacing4}
      display={showLoading ? 'flex' : undefined}
      justifyContent={showLoading ? 'center' : undefined}
    >
      <Button
        isDisabled={showLoading}
        testId="button"
        onClick={handleClick}
        variant="primary"
        ariaDescribedBy={ariaDescribedBy}
        isFullWidth
        label={label}
      />
    </Box>
  );
};

export default WebAuthNSubmit;
