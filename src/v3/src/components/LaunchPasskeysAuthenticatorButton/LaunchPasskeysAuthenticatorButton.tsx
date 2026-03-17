/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Button as OdyButton, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { ABORT_REASON_CLEANUP, IDX_STEP } from 'src/constants';
import { useWidgetContext } from 'src/contexts';
import { useAutoFocus, useOnSubmit } from 'src/hooks';
import { ClickHandler, LaunchPasskeysAuthenticatorButtonElement, UISchemaElementComponent } from 'src/types';
import { getTranslation, loc } from 'src/util';

import { PasskeysIcon } from '../Icon';

const LaunchPasskeysAuthenticatorButton: UISchemaElementComponent<{
  uischema: LaunchPasskeysAuthenticatorButtonElement
}> = ({ uischema }) => {
  const tokens = useOdysseyDesignTokens();
  const onSubmitHandler = useOnSubmit();
  const {
    translations = [],
    focus,
    options: { getCredentials },
  } = uischema;

  const focusRef = useAutoFocus<HTMLButtonElement>(focus);
  const {
    setMessage,
    abortController,
  } = useWidgetContext();

  const handleClick: ClickHandler = async () => {
    if (typeof AbortController === 'undefined') {
      return;
    }

    // Abort any existing in-flight autofill requests
    if (abortController && !abortController.signal.aborted) {
      abortController.abort(ABORT_REASON_CLEANUP);
    }
    setMessage(undefined);

    const controller = new AbortController();

    try {
      const credentials = await getCredentials(controller);
      if (credentials) {
        onSubmitHandler({
          params: { credentials },
          step: IDX_STEP.LAUNCH_PASSKEYS_AUTHENTICATOR,
          includeData: false,
        });
      }
    } catch (err) {
      let key = 'signin.passkeys.error';
      if (err !== undefined && err.name !== undefined) {
        switch (err.name) {
          case 'NotSupportedError':
            key = `signin.passkeys.error.${err.name}`;
            break;
          case 'SecurityError':
            if (err.code !== 18) { break; }
            key = `signin.passkeys.error.${err.name}`;
            break;
          default:
            break;
        }
      }
      setMessage({
        message: loc(key, 'login'),
        class: 'ERROR',
        i18n: { key },
      });
    }
  };

  const label = getTranslation(translations, 'label');
  const iconDescription = getTranslation(translations, 'icon-description') || '';

  return (
    <OdyButton
      variant="secondary"
      isFullWidth
      onClick={handleClick}
      buttonRef={focusRef}
      label={label || ''}
      startIcon={(
        <PasskeysIcon
          name="mfa-passkeys"
          description={iconDescription}
          width={tokens.Spacing5}
          height={tokens.Spacing5}
        />
      )}
    />
  );
};

export default LaunchPasskeysAuthenticatorButton;
