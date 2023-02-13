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

import { Alert, Box, Link } from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import { ReminderElement, UISchemaElementComponent } from '../../types';
import TextWithHtml from '../TextWithHtml';

export const DEFAULT_TIMEOUT_MS = 30_000;

const ReminderPrompt: UISchemaElementComponent<{
  uischema: ReminderElement
}> = ({ uischema }) => {
  const {
    loading,
  } = useWidgetContext();
  const {
    content,
    step,
    actionParams,
    isActionStep,
    buttonText,
    timeout: customTimeout,
    contentClassname,
    contentHasHtml,
  } = uischema.options;
  const onSubmitHandler = useOnSubmit();

  const [show, setShow] = useState<boolean>(false);
  const timerRef = useRef<number | undefined>();

  const RESEND_TIMESTAMP_SESSION_STORAGE_KEY = 'osw-oie-resend-timestamp';
  const removeResendTimestamp = () => {
    sessionStorage.removeItem(RESEND_TIMESTAMP_SESSION_STORAGE_KEY);
  };
  const setResendTimestamp = (token: string) => {
    sessionStorage.setItem(RESEND_TIMESTAMP_SESSION_STORAGE_KEY, token);
  };

  // eslint-disable-next-line arrow-body-style
  const getResendTimestamp = (): string | null => {
    return sessionStorage.getItem(RESEND_TIMESTAMP_SESSION_STORAGE_KEY);
  };

  const startTimer = () => {
    setShow(false);
    const timeStamp = getResendTimestamp();
    if (!timeStamp) {
      setResendTimestamp(Date.now().toString());
    }
    if (timerRef) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      const start = parseInt(getResendTimestamp() as string);
      const now = Date.now();
      const timeout = typeof customTimeout === 'number' ? customTimeout : DEFAULT_TIMEOUT_MS;
      if (now - start >= timeout) {
        setShow(true);
        window.clearInterval(timerRef.current);
        removeResendTimestamp();
      }
    }, 250);
  };

  useEffect(() => {
    startTimer();

    return () => {
      window.clearInterval(timerRef.current);
      removeResendTimestamp();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resendHandler = async () => {
    if (loading) {
      return;
    }
    startTimer();

    await onSubmitHandler({ step, isActionStep, params: actionParams });
  };

  const renderActionLink = () => {
    if (!buttonText) {
      return undefined;
    }

    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link
        // eslint-disable-next-line no-script-url
        href="javascript:void(0);"
        onClick={() => resendHandler()}
      >
        {buttonText}
      </Link>
    );
  };

  const renderAlertContent = () => {
    if (contentHasHtml && contentClassname) {
      return (
        <TextWithHtml
          uischema={{
            type: 'TextWithHtml',
            options: {
              contentClassname,
              content,
              submitOnClick: true,
              step,
              isActionStep,
              actionParams,
            },
          }}
        />
      );
    }
    return (<Box marginBlockEnd={2}>{content}</Box>);
  };

  return show ? (
    <Box marginBlockEnd={4}>
      <Alert
        severity="warning"
        variant="infobox"
        sx={{
          // TODO: OKTA-534606 - switch to ODS component which has this fix
          '& .MuiAlert-message': {
            overflow: 'visible',
          },
        }}
      >
        {renderAlertContent()}
        {renderActionLink()}
      </Alert>
    </Box>
  ) : null;
};

export default ReminderPrompt;