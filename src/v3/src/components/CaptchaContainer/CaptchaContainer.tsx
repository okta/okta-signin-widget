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

import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Box } from '@mui/material';
import { useEffect, useRef } from 'preact/hooks';
import ReCAPTCHA from 'react-google-recaptcha';

import Logger from '../../../../util/Logger';
import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import {
  CaptchaContainerElement,
  UISchemaElementComponent,
} from '../../types';

declare global {
  interface Window {
    recaptchaOptions?: {
      // https://github.com/dozoisch/react-google-recaptcha#advanced-usage
      useRecaptchaNet?: boolean;
      enterprise?: boolean;
      nonce?: string;
    }
  }
}

const CaptchaContainer: UISchemaElementComponent<{
  uischema: CaptchaContainerElement
}> = ({ uischema }) => {
  const {
    options: {
      siteKey,
      type: captchaType,
      captchaId,
    },
  } = uischema;

  const { dataSchemaRef, widgetProps } = useWidgetContext();
  const { hcaptcha: hcaptchaOptions, recaptcha: recaptchaOptions } = widgetProps;
  const onSubmitHandler = useOnSubmit();
  const dataSchema = dataSchemaRef.current!;
  const captchaRef = useRef<ReCAPTCHA | HCaptcha>(null);

  const isHcaptchaInstance = (captchaObj: HCaptcha | ReCAPTCHA)
  : captchaObj is HCaptcha => captchaObj instanceof HCaptcha;

  // Customizig reCAPTCHA script URI can be done with global `recaptchaOptions` object:
  // https://github.com/dozoisch/react-google-recaptcha#advanced-usage
  if (captchaType === 'RECAPTCHA_V2' && recaptchaOptions?.scriptSource && !window.recaptchaOptions) {
    const useRecaptchaNet = recaptchaOptions.scriptSource?.includes('recaptcha.net');
    window.recaptchaOptions = {
      useRecaptchaNet,
    };
  }

  useEffect(() => {
    // set the reference in dataSchema context to this captcha instance
    dataSchema.captchaRef = captchaRef;
    if (captchaRef.current !== null) {
      //  For some reason Hcaptcha does not initially auto render only when in development mode
      //  https://github.com/hCaptcha/react-hcaptcha/issues/53
      //  May be an issue with compiling typescript and hot module updating
      //  This delayed manual render is only used in development mode for hcaptcha
      if (process.env.NODE_ENV === 'development' && isHcaptchaInstance(captchaRef.current)) {
        setTimeout(() => {
          if (isHcaptchaInstance(captchaRef.current!)) {
            captchaRef.current?.renderCaptcha();
          }
        }, 500);
      }
    }
    return () => {
      dataSchema.captchaRef = undefined;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSchema]);

  const resetCaptchaContainer = () => {
    if (captchaRef.current === null) {
      return;
    }

    if (isHcaptchaInstance(captchaRef.current)) {
      captchaRef.current.resetCaptcha();
    } else {
      captchaRef.current.reset();
    }
  };

  const onVerifyCaptcha = (token: string | null) => {
    if (!token) {
      Logger.error('captcha token expired');
      return;
    }

    const {
      submit: {
        actionParams: params,
        step,
        includeImmutableData,
      },
    } = dataSchema;

    // insert received captcha success token into the captchaVerify submit param
    const captchaSubmitParams = {
      captchaVerify: {
        captchaToken: token,
        captchaId,
      },
      ...params,
    };

    // Captcha challenge solved successfully, submit form
    onSubmitHandler({
      includeData: true,
      includeImmutableData,
      params: captchaSubmitParams,
      step,
    });

    // tokens are one-time use, so if we submit the same token twice then it will be rejected
    // by the server the second time, so we must reset the captcha state
    resetCaptchaContainer();
  };

  if (captchaType === 'RECAPTCHA_V2') {
    return (
      // set z-index to 1 for ReCaptcha so the badge does not get covered by the footer
      <Box
        zIndex={1}
        position="relative"
      >
        <ReCAPTCHA
          id="captcha-container"
          sitekey={siteKey}
          ref={captchaRef}
          onChange={onVerifyCaptcha}
          size="invisible"
          badge="bottomright"
        />
      </Box>
    );
  }
  return (
    <HCaptcha
      // Params like `apihost` will be passed to hCaptcha loader.
      // Supported params for hCaptcha script:
      //  https://github.com/hCaptcha/hcaptcha-loader#props
      //  (starting from 'apihost')
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(hcaptchaOptions?.scriptParams || {})}
      scriptSource={hcaptchaOptions?.scriptSource}
      id="captcha-container"
      sitekey={siteKey}
      ref={captchaRef}
      onVerify={onVerifyCaptcha}
      size="invisible"
      // Fixes issue with IE11:
      // If hCaptcha loader removes <script>, `onload` callback won't be executed
      cleanup={false}
    />
  );
};

export default CaptchaContainer;
