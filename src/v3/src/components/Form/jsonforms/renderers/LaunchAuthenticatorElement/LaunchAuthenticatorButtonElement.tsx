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

import { RendererProps } from '@jsonforms/core';
import { withJsonFormsRendererProps } from '@jsonforms/react';
import { Button as OdyButton, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import Util from '../../../../../../../util/Util';
import { CHALLENGE_METHOD } from '../../../../../constants';
import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus, useOnSubmit } from '../../../../../hooks';
import {
  ClickHandler,
} from '../../../../../types';
import {
  getBaseUrl, isAndroid, setUrlQueryParams,
} from '../../../../../util';
import { OktaVerifyIcon } from '../../../../Icon';

const LaunchAuthenticatorButtonElement: FunctionComponent<RendererProps> = ({
    uischema,
}) => {
  const tokens = useOdysseyDesignTokens();
  const onSubmitHandler = useOnSubmit();
  const {
    options: {
      step,
      deviceChallengeUrl,
      challengeMethod,
      focus,
      label,
    } = {},
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
    if (deviceChallengeUrl) {
      const loginHintQueryParam = loginHint ? { login_hint: loginHint } : undefined;
      const urlObj = new URL(deviceChallengeUrl, getBaseUrl(widgetProps));
      if (isAndroid() && challengeMethod !== CHALLENGE_METHOD.APP_LINK) {
        Util.redirectWithFormGet(setUrlQueryParams(urlObj, loginHintQueryParam));
      } else {
        window.location.assign(setUrlQueryParams(urlObj, loginHintQueryParam));
      }
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

//   const label = getTranslation(translations, 'label');
//   const iconDescription = getTranslation(translations, 'icon-description') || '';

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
          description={label}
          width={tokens.Spacing5}
          height={tokens.Spacing5}
        />
      )}
    />
  );
};

const WrappedLaunchAuthenticatorButtonElement = withJsonFormsRendererProps(LaunchAuthenticatorButtonElement);
export default WrappedLaunchAuthenticatorButtonElement;
