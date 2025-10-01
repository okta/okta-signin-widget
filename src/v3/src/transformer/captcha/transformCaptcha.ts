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
  CaptchaContainerElement,
  DescriptionElement,
  TransformStepFnWithOptions,
} from '../../types';
import { isCaptchaEnabled, loc } from '../../util';

export const transformCaptcha: TransformStepFnWithOptions = ({ transaction }) => (
  formbag,
) => {
  if (!isCaptchaEnabled(transaction)) {
    return formbag;
  }

  const {
    context: {
      // @ts-expect-error OKTA-627610 captcha missing from context type
      captcha: {
        value: {
          id: captchaId,
          type: captchaType,
          siteKey,
        },
      },
    },
  } = transaction;

  if (!['HCAPTCHA', 'RECAPTCHA_V2'].includes(captchaType)) {
    return formbag;
  }

  // if HCAPTCHA type, render the footer - we need to do this manually since the HCAPTCHA lib doesn't do it
  if (captchaType === 'HCAPTCHA') {
    const hcaptchaFooterContent = loc(
      'hcaptcha.footer.label',
      'login',
      undefined,
      {
        $1: { element: 'a', attributes: { href: 'https://hcaptcha.com/privacy' } },
        $2: { element: 'a', attributes: { href: 'https://hcaptcha.com/terms' } },
      },
    );
    formbag.uischema.elements.push({
      type: 'Description',
      options: {
        variant: 'subtitle1',
        content: hcaptchaFooterContent,
      },
    } as DescriptionElement);
  }

  const captchaContainer: CaptchaContainerElement = {
    type: 'CaptchaContainer',
    options: {
      captchaId,
      siteKey,
      type: captchaType,
    },
  };

  formbag.uischema.elements.push(captchaContainer);

  return formbag;
};
