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

import { Button as OdyButton, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import Util from '../../../../util/Util';
import { CHALLENGE_METHOD, IDX_STEP } from '../../constants';
import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnSubmit } from '../../hooks';
import {
  ClickHandler,
  LaunchAuthenticatorButtonElement,
  UISchemaElementComponent,
} from '../../types';
import {
  getBaseUrl, getTranslation, isAndroid, setUrlQueryParams,
} from '../../util';
// TEMPORARY DEBUG — OKTA-1250822. Remove with util/nfcDebug.ts.
import { nfcDebugLog } from '../../util/nfcDebug';
import { OktaVerifyIcon } from '../Icon';

const LaunchAuthenticatorButton: UISchemaElementComponent<{
  uischema: LaunchAuthenticatorButtonElement
}> = ({ uischema }) => {
  const tokens = useOdysseyDesignTokens();
  const onSubmitHandler = useOnSubmit();
  const {
    translations = [],
    focus,
    options: {
      step,
      deviceChallengeUrl,
      challengeMethod,
    },
  } = uischema;

  const focusRef = useAutoFocus<HTMLButtonElement>(focus);
  const {
    loginHint,
    setloginHint,
    data,
    widgetProps,
  } = useWidgetContext();

  const handleClick: ClickHandler = async () => {
    if (data.identifier) {
      // set loginHint in widget context to the current Username input field data
      setloginHint(data.identifier as string);
    }
    // OKTA-1250822: For the NFC launch step, do NOT fire the launch-screen context challenge
    // here. That challenge (from context.authenticatorChallenge) is a *different*, soon-to-be
    // stale challenge than the one the server mints at /authenticators/nfc/launch and then
    // polls for. Firing it opens Okta Verify on the wrong challenge; when the poll screen
    // later fires the correct challenge, OV is already committed to the stale one and the
    // flow hangs. The challenge-poll screen (OpenOktaVerifyFPButton / loopback probe) is
    // responsible for launching OV with the correct challenge — matching v2, whose
    // SignInWithNfcView only invokes the launch action and fires no deep link on click.
    const isNfcLaunch = step === IDX_STEP.LAUNCH_NFC_AUTHENTICATOR;
    if (deviceChallengeUrl && !isNfcLaunch) {
      const loginHintQueryParam = loginHint ? { login_hint: loginHint } : undefined;
      const urlObj = new URL(deviceChallengeUrl, getBaseUrl(widgetProps));
      const firedUrl = setUrlQueryParams(urlObj, loginHintQueryParam);
      // TEMPORARY DEBUG — OKTA-1250822.
      nfcDebugLog('LaunchAuthenticatorButton fires deep link to OV', {
        step,
        challengeMethod,
        url: firedUrl,
      });
      if (isAndroid() && challengeMethod !== CHALLENGE_METHOD.APP_LINK) {
        Util.redirectWithFormGet(firedUrl);
      } else {
        window.location.assign(firedUrl);
      }
    } else {
      // TEMPORARY DEBUG — OKTA-1250822.
      nfcDebugLog('LaunchAuthenticatorButton NOT firing deep link on click (poll screen will fire correct challenge)', {
        step,
        challengeMethod,
        deviceChallengeUrl,
        isNfcLaunch,
      });
    }
    onSubmitHandler({
      step,
      isActionStep: !!data.rememberMe,
      // pass the rememberMe checkbox value into the request params
      params: {
        rememberMe: data.rememberMe,
      },
    });
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
        <OktaVerifyIcon
          name="mfa-okta-verify"
          description={iconDescription}
          width={tokens.Spacing5}
          height={tokens.Spacing5}
        />
      )}
    />
  );
};

export default LaunchAuthenticatorButton;
