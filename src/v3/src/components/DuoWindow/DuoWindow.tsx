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

// import Duo from '../../../../../packages/vendor/duo_web_sdk';
import Duo from '@okta/duo';
import { FunctionComponent, h } from 'preact';
import React from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import {
  DuoWindowElement,
  UISchemaElementComponent,
} from '../../types';
import { getTranslation, loc } from '../../util';
import style from './style.css';

type IFrameProps = {
  title: string;
};

const IFrame: FunctionComponent<IFrameProps> = ({ title }) => (
  <iframe
    id="duo_iframe"
    class={style.duo_form}
    title={title}
    frameBorder={0}
  />
);

const DuoWindow: UISchemaElementComponent<{
  uischema: DuoWindowElement
}> = ({ uischema }) => {
  const {
    options: {
      host,
      signedToken,
      step,
    },
    translations = [],
  } = uischema;
  const { data, setMessage } = useWidgetContext();
  const [duoFailed, setDuoFailed] = useState(false);
  const handleDuoAuthSuccess = useOnSubmit();
  const iframeTitle = getTranslation(translations, 'title') ?? ' Duo authenticator iframe';

  useEffect(() => {
    try {
      Duo.init({
        host,
        sig_request: signedToken,
        iframe: document.getElementById('duo_iframe'),
        post_action: (signedData: string) => {
          data['credentials.signatureData'] = signedData;
          handleDuoAuthSuccess({
            step,
            includeData: true,
          });
        },
      });
    } catch (e) {
      setDuoFailed(true);
      setMessage({
        message: loc('oie.duo.iFrameError', 'login'),
        class: 'ERROR',
        i18n: { key: 'oie.duo.iFrameError' },
      });
      console.error(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      { !duoFailed && <IFrame title={iframeTitle} /> }
    </React.Fragment>
  );
};

export default DuoWindow;
