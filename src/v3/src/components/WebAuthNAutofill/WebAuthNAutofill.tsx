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

import { isEmpty } from 'lodash';
import { useEffect } from 'preact/hooks';
import {
  ABORT_REASON_CLEANUP,
  ABORT_REASON_WEBAUTHN_AUTOFILLUI_STEP_NOT_FOUND,
  IDX_STEP,
} from 'src/constants';
import { useWidgetContext } from 'src/contexts';
import { useOnSubmit } from 'src/hooks';
import { UISchemaElementComponent, WebAuthNAutofillElement } from 'src/types';
import { isPasskeyAutofillAvailable, loc } from 'src/util';

const WebAuthNAutofill: UISchemaElementComponent<{
  uischema: WebAuthNAutofillElement;
}> = ({ uischema }) => {
  const {
    abortController,
    setAbortController,
    setMessage,
  } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const { options } = uischema;

  const executeNextStep = async (controller: AbortController | undefined) => {
    if (await isPasskeyAutofillAvailable()) {
      try {
        const credentials = await options.getCredentials(controller);

        if (credentials) {
          onSubmitHandler({
            params: { credentials },
            step: IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR,
            includeData: false,
          });
        }
      } catch (err) {
        // iOS Safari throws an empty object when the user does not use passkey autofill
        if (isEmpty(err)) {
          return;
        }
        // if we explicitly abort with the following messages
        // there is no need to display any kind of error to the user as
        // this is expected behavior
        const ignoredErrors = [
          ABORT_REASON_CLEANUP,
          ABORT_REASON_WEBAUTHN_AUTOFILLUI_STEP_NOT_FOUND,
        ];
        if (ignoredErrors.includes(err as string)) {
          return;
        }

        setMessage({
          message: loc('oie.webauthn.error.invalidPasskey', 'login'),
          class: 'ERROR',
          i18n: { key: 'oie.webauthn.error.invalidPasskey' },
        });
      }
    }
  };

  useEffect(() => {
    if (typeof AbortController === 'undefined') {
      return;
    }

    if (abortController === undefined) {
      setAbortController(new AbortController());
    }
    executeNextStep(abortController);
    // eslint-disable-next-line consistent-return
    return () => {
      abortController?.abort(ABORT_REASON_CLEANUP);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abortController]);

  return null;
};

export default WebAuthNAutofill;
