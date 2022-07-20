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
import { Button, CircularLoadIndicator } from '@okta/odyssey-react';
import { IdxActionParams } from '@okta/okta-auth-js';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import { useTranslation } from '../../lib/okta-i18n';
import {
  ClickHandler,
  UISchemaElementComponent,
  WebAuthNButtonElement,
} from '../../types';

const WebAuthNSubmit: UISchemaElementComponent<{
  uischema: WebAuthNButtonElement
}> = ({ uischema }) => {
  const { options } = uischema;

  const { setMessage } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const { t, i18n } = useTranslation();
  const [waiting, setWaiting] = useState<boolean>(false);

  const waitingIndicatorLabel = t('renderers.waiting.indicator.label');
  const waitingIndicatorStateLabel = t('renderers.waiting.indicator.state.label');

  const getErrorMessage = (error: Error): string => {
    const expectedErrorKey = `oie.browser.error.${error.name}`;
    if (i18n.exists(expectedErrorKey)) {
      return t(expectedErrorKey);
    }
    return error.message;
  };

  const executeNextStep = () => {
    if (options?.showLoadingIndicator) {
      setWaiting(true);
    }
    setMessage(undefined);

    options?.onClick()
      .then(async (params: IdxActionParams) => {
        onSubmitHandler({
          params,
          includeData: true,
        });
      })
      .catch((error: Error) => {
        const message = getErrorMessage(error);
        setMessage({
          message,
          class: 'ERROR',
          i18n: { key: message },
        });
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
      marginBottom={4}
      display={waiting ? 'flex' : undefined}
      justifyContent={waiting ? 'center' : undefined}
    >
      {
        waiting
          ? (
            <CircularLoadIndicator
              id="okta-spinner"
              aria-label={waitingIndicatorLabel}
              aria-valuetext={waitingIndicatorStateLabel}
            />
          )
          : (
            <Button
              data-se="button"
              size="l"
              onClick={handleClick}
              variant="primary"
              wide
            >
              { t(options?.label) }
            </Button>
          )
      }
    </Box>
  );
};

export default WebAuthNSubmit;
