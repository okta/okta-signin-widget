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
import { Box } from '@okta/odyssey-react-mui';
import { useEffect, useRef } from 'preact/hooks';
import ReCAPTCHA from 'react-google-recaptcha';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import {
  CaptchaContainerElement,
  UISchemaElementComponent,
} from '../../types';

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

  const { dataSchemaRef } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const dataSchema = dataSchemaRef.current!;
  const captchaRef = useRef<ReCAPTCHA | HCaptcha>(null);

  useEffect(() => {
    // set the reference in dataSchema context to this captcha instance
    dataSchema.captchaRef = captchaRef;
    //  For some reason Hcaptcha does not initially auto render only when in development mode
    //  This delayed manual render is only used in development mode for hcaptcha
    if (process.env.NODE_ENV === 'development' && captchaType === 'HCAPTCHA') {
      setTimeout(() => {
        (captchaRef.current as HCaptcha)?.renderCaptcha();
      }, 500);
    }
    return () => {
      dataSchema.captchaRef = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onVerifyCaptcha = (token: string | null) => {
    if (!token) {
      console.error('captcha token expired');
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
  };

  const onErrorCaptcha = (e: Event | string) => {
    console.error(e);
  };

  if (captchaType === 'RECAPTCHA_V2') {
    return (
      // set z-index to 9999 for ReCaptcha so the badge does not get covered by the footer
      <Box zIndex={9999}>
        <ReCAPTCHA
          id="captcha-container"
          sitekey={siteKey}
          ref={captchaRef}
          onChange={onVerifyCaptcha}
          onError={onErrorCaptcha}
          size="invisible"
          badge="bottomright"
        />
      </Box>
    );
  } else {
    return (
      <HCaptcha
        id="captcha-container"
        sitekey={siteKey}
        ref={captchaRef}
        onVerify={onVerifyCaptcha}
        onError={onErrorCaptcha}
        size="invisible"
      />
    );
  }
};

export default CaptchaContainer;
