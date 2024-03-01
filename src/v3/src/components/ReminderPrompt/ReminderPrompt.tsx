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
import { Callout, Link, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { HTMLReactParserOptions } from 'html-react-parser';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useHtmlContentParser, useOnSubmit } from '../../hooks';
import { ReminderElement, UISchemaElementComponent } from '../../types';
import { getLinkReplacerFn, SessionStorage } from '../../util';
import TextWithActionLink from '../TextWithActionLink';

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
  const parsedContent = useHtmlContentParser(content, uischema.parserOptions);
  const tokens = useOdysseyDesignTokens();

  const [show, setShow] = useState<boolean>(false);
  const timerRef = useRef<number | undefined>();

  const startTimer = () => {
    setShow(false);
    const timeStamp = SessionStorage.getResendTimestamp();
    if (!timeStamp) {
      SessionStorage.setResendTimestamp(Date.now().toString());
    }
    if (timerRef) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      const ts = SessionStorage.getResendTimestamp() || Date.now().toString();
      const start = parseInt(ts, 10);
      const now = Date.now();
      const timeout = typeof customTimeout === 'number' ? customTimeout : DEFAULT_TIMEOUT_MS;
      if (now - start >= timeout) {
        setShow(true);
        window.clearInterval(timerRef.current);
        SessionStorage.removeResendTimestamp();
      }
    }, 250);
  };

  useEffect(() => {
    startTimer();

    return () => {
      window.clearInterval(timerRef.current);
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
        variant="monochrome"
        onClick={() => resendHandler()}
      >
        {buttonText}
      </Link>
    );
  };

  const renderAlertContent = () => {
    if (contentHasHtml && contentClassname) {
      const parserOptions: HTMLReactParserOptions = {};
      parserOptions.replace = getLinkReplacerFn(parserOptions, 'monochrome');
      return (
        <TextWithActionLink
          uischema={{
            type: 'TextWithActionLink',
            parserOptions,
            options: {
              contentClassname,
              content,
              step,
              isActionStep,
              actionParams,
            },
          }}
        />
      );
    }
    return (
      <Box marginBlockEnd={tokens.Spacing2}>{parsedContent}</Box>
    );
  };

  return show ? (
    <Box marginBlockEnd={tokens.Spacing4}>
      <Callout
        severity="warning"
        // visually-hidden severity text is not translated
        translate="no"
      >
        {renderAlertContent()}
        {renderActionLink()}
      </Callout>
    </Box>
  ) : null;
};

export default ReminderPrompt;
