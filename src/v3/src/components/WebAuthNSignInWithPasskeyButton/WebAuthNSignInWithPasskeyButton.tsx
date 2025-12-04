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

import { Button } from '@okta/odyssey-react-mui';
import { isEmpty } from 'lodash';

import {
  ABORT_REASON_CLEANUP,
  ABORT_REASON_WEBAUTHN_AUTOFILLUI_STEP_NOT_FOUND,
  IDX_STEP,
} from '../../constants';
import { useOnSubmit } from '../../hooks';
import { PasskeyButtonElement, UISchemaElementComponent } from '../../types';
import { isPasskeyAutofillAvailable } from '../../util';

const WebAuthNSignInWithPasskeyButton: UISchemaElementComponent<{
  uischema: PasskeyButtonElement;
}> = ({ uischema }) => {
  const onSubmitHandler = useOnSubmit();
  const { options } = uischema;

  let abortController: AbortController;

  if (typeof AbortController !== 'undefined') {
    abortController = new AbortController();
  }

  const onClickHandler = async () => {
    if (await isPasskeyAutofillAvailable()) {
      try {
        const credentials = await options.getCredentials(abortController);
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

        console.error('Error during passkey sign-in:', err);
      }
    } else {
      abortController?.abort(ABORT_REASON_CLEANUP);
    }
  };

  return (
    <Button
      type="button"
      isFullWidth
      variant="secondary"
      label="Sign in with a passkey"
      onClick={onClickHandler}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        gap: '8px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        background: '#fff',
      }}
    />
  );
};

export default WebAuthNSignInWithPasskeyButton;
