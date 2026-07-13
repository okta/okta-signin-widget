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
import { useEffect } from 'preact/hooks';

import Util from '../../../../util/Util';
import {
  ButtonElement,
  ButtonType,
  RedirectElement,
  UISchemaElementComponent,
} from '../../types';
import { loc } from '../../util';
import Button from '../Button';

const isPostAppLinkVerification = (
  priorVerification: RedirectElement['options']['priorVerification'],
): boolean => priorVerification?.method === 'APP_LINK' && priorVerification?.success === true;

const Redirect: UISchemaElementComponent<{ uischema: RedirectElement }> = ({
  uischema: { options },
}) => {
  // OKTA-1182955: when the backend signaled a successful prior Android AppLink (FastPass) verification,
  // render a Continue button instead of auto-redirecting. The user click guarantees window focus before
  // the redirect, avoiding the visible-but-not-focused race that otherwise lands on login.okta.com.
  const showAppLinkContinueButton = isPostAppLinkVerification(options?.priorVerification);

  useEffect(() => {
    // we only want this to ever happen once (on initial component mount) and when document is visible
    if (options?.url && !showAppLinkContinueButton) {
      Util.executeOnVisiblePage(() => {
        Util.changeLocation(options.url);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!showAppLinkContinueButton || !options?.url) {
    return null;
  }

  const buttonUiSchema: ButtonElement = {
    type: 'Button',
    label: loc('oie.optional.authenticator.button.title', 'login'),
    options: {
      type: ButtonType.BUTTON,
      variant: 'primary',
      wide: true,
      onClick: () => {
        Util.changeLocation(options.url);
      },
    },
  };

  return (
    <React.Fragment>
      <Button uischema={buttonUiSchema} />
    </React.Fragment>
  );
};

export default Redirect;
