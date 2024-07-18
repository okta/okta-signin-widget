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

import { h } from 'preact';
import React from 'preact/compat';
import { useState } from 'preact/hooks';

import Util from '../../../../util/Util';
import { CHALLENGE_METHOD } from '../../constants';
import { useWidgetContext } from '../../contexts';
import {
  ButtonElement,
  ButtonType,
  OpenOktaVerifyFPButtonElement,
  UISchemaElementComponent,
} from '../../types';
import {
  getBaseUrl, getTranslation, isAndroid, setUrlQueryParams,
} from '../../util';
import Button from '../Button';
import HiddenIFrame from '../HiddenIFrame';

const OpenOktaVerifyFPButton: UISchemaElementComponent<{
  uischema: OpenOktaVerifyFPButtonElement
}> = ({ uischema }) => {
  const {
    translations = [],
    focus,
    ariaDescribedBy,
    options: {
      step,
      href,
      challengeMethod,
    },
  } = uischema;
  const [key, setKey] = useState<number>(0);
  const label = getTranslation(translations, 'label');
  const { loginHint, widgetProps } = useWidgetContext();
  const urlObj = new URL(href as string, getBaseUrl(widgetProps));
  const loginHintQueryParam = loginHint ? { login_hint: loginHint } : undefined;
  const deviceChallengeUrl = setUrlQueryParams(urlObj, loginHintQueryParam);

  const buttonUiSchema: ButtonElement = {
    type: 'Button',
    label,
    focus,
    ariaDescribedBy,
    options: {
      type: ButtonType.BUTTON,
      variant: 'primary',
      wide: true,
      step,
      onClick: () => {
        const isAppLinkMethod = challengeMethod === CHALLENGE_METHOD.APP_LINK;
        const isUniversalLinkMethod = challengeMethod === CHALLENGE_METHOD.UNIVERSAL_LINK;
        const isCustomUriMethod = challengeMethod === CHALLENGE_METHOD.CUSTOM_URI;
        if ((isAppLinkMethod || isUniversalLinkMethod) && href) {
          if (isAndroid() && isUniversalLinkMethod) {
            Util.redirectWithFormGet(deviceChallengeUrl);
          } else {
            window.location.assign(deviceChallengeUrl);
          }
        }

        // on button click in CUSTOM_URI method, this forces iframe to re-render and trigger the URL to load again
        if (isCustomUriMethod) {
          setKey(key + 1);
        }
      },
    },
  };

  return (
    <React.Fragment>
      <Button uischema={buttonUiSchema} />
      {(href && challengeMethod === CHALLENGE_METHOD.CUSTOM_URI) && (
        <HiddenIFrame
          key={key}
          id="custom-uri-container"
          src={deviceChallengeUrl}
        />
      )}
    </React.Fragment>
  );
};

export default OpenOktaVerifyFPButton;
