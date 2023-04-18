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

// eslint-disable-next-line import/no-extraneous-dependencies
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
import { loc } from '../../util';

type IFrameProps = {
  title: string;
};

const IFrame: FunctionComponent<IFrameProps> = ({ title }) => (
  <iframe
    id="duo_iframe"
    title={title}
    height="400px"
    width="100%"
    frameBorder={0}
  />
);

const DuoWindow: UISchemaElementComponent<{
  uischema: DuoWindowElement
}> = ({ uischema }) => {
  const {
    options: {
      title: iframeTitle,
      host,
      signedToken,
      step,
    },
  } = uischema;
  const { setMessage } = useWidgetContext();
  const [duoFailed, setDuoFailed] = useState(false);
  const handleDuoAuthSuccess = useOnSubmit();

  useEffect(() => {
    try {
      Duo.init({
        host,
        sig_request: signedToken,
        iframe: document.getElementById('duo_iframe'),
        post_action: (signedData: string) => {
          handleDuoAuthSuccess({
            params: { 'credentials.signatureData': signedData },
            step,
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
