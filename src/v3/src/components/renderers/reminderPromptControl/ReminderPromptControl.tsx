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

import { ControlProps } from '@jsonforms/core';
import {
  Box,
  Infobox,
  Link,
  Text,
} from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { useTranslation } from '../../../lib/okta-i18n';
import { Undefinable } from '../../../types';

export const DEFAULT_TIMEOUT_MS = 30_000;

const ReminderPromptControl: FunctionComponent<ControlProps> = ({ uischema }) => {
  const { t } = useTranslation();

  const [show, setShow] = useState<boolean>(false);
  const timerRef = useRef<Undefinable<number>>();

  const startTimer = () => {
    if (timerRef) {
      window.clearTimeout(timerRef.current);
    }

    setShow(false);

    const timeout = typeof uischema.options?.timeout === 'number' ? uischema.options.timeout : DEFAULT_TIMEOUT_MS;

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

    await uischema.options?.action?.({ resend: true });
  };

  const content = (
    // @ts-ignore OKTA-471233
    <Box>
      <Text
        as="div"
      >
        {t(uischema.options?.ctaText)}
      </Text>
    </Box>
  );
  const actions = (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link
      // eslint-disable-next-line no-script-url
      href="javascript:void(0);"
      onClick={() => resendHandler()}
    >
      {t('email.button.resend')}
    </Link>
  );

  return show ? (
    // @ts-ignore OKTA-471233
    <Box
      role="alert"
      width="full"
      marginBottom="m"
    >
      <Infobox
        variant="caution"
        content={content}
        actions={actions}
      />
    </Box>
  ) : null;
};

export default ReminderPromptControl;
