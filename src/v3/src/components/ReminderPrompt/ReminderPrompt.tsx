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

import {
  Alert,
  Box,
  Link,
} from '@mui/material';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { useOnSubmit } from '../../hooks';
import { ReminderElement, UISchemaElementComponent } from '../../types';
import TextWithHtml from '../TextWithHtml';

export const DEFAULT_TIMEOUT_MS = 30_000;

const ReminderPrompt: UISchemaElementComponent<{
  uischema: ReminderElement
}> = ({ uischema }) => {
  const {
    content: ctaText,
    step,
    actionParams,
    isActionStep,
    buttonText: linkLabel,
    timeout: customTimeout,
    contentClassname: className,
    contentHasHtml,
  } = uischema.options;
  const onSubmitHandler = useOnSubmit();

  const [show, setShow] = useState<boolean>(false);
  const timerRef = useRef<number | undefined>();

  const startTimer = () => {
    if (timerRef) {
      window.clearTimeout(timerRef.current);
    }

    setShow(false);

    const timeout = typeof customTimeout === 'number' ? customTimeout : DEFAULT_TIMEOUT_MS;

    timerRef.current = window.setTimeout(() => setShow(true), timeout);
  };

  useEffect(() => {
    startTimer();

    return () => {
      window.clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resendHandler = async () => {
    startTimer();

    await onSubmitHandler({ step, isActionStep, params: actionParams });
  };

  const renderActionLink = () => {
    if (!linkLabel) {
      return undefined;
    }

    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link
        // eslint-disable-next-line no-script-url
        href="javascript:void(0);"
        onClick={() => resendHandler()}
      >
        {linkLabel}
      </Link>
    );
  };

  const renderAlertContent = () => {
    if (contentHasHtml && className) {
      return (
        <TextWithHtml
          uischema={{
            type: 'TextWithHtml',
            options: {
              className,
              content: ctaText,
              step,
              isActionStep,
              actionParams,
            },
          }}
        />
      );
    }
    return (<Box marginBottom={2}>{ctaText}</Box>);
  };

  return show ? (
    <Box marginBottom={4}>
      <Alert
        severity="warning"
        variant="infobox"
      >
        {renderAlertContent()}
        {renderActionLink()}
      </Alert>
    </Box>
  ) : null;
};

export default ReminderPrompt;
