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

import { FunctionComponent, h } from 'preact';
import React from 'preact/compat';
import { useState } from 'preact/hooks';

import {
  ButtonElement,
  ButtonType,
  OpenOktaVerifyButtonElement,
  UISchemaElementComponent,
} from '../../types';
import { getTranslation } from '../../util';
import Button from '../Button';

type IFrameProps = {
  src: string;
}
const IFrame: FunctionComponent<IFrameProps> = ({ src }) => {
  return (
    <iframe src={src} style='display: none' />
  )
}

const OpenOktaVerifyButton: UISchemaElementComponent<{
  uischema: OpenOktaVerifyButtonElement
}> = ({ uischema }) => {
  const {
    translations = [],
    options: {
      step,
      href,
    }
  } = uischema;
  const [key, setKey] = useState<number>(0);
  const label = getTranslation(translations, 'label') || 'Open Okta Verify';

  const buttonUiSchema: ButtonElement = {
    type: 'Button',
    label,
    options: {
      type: ButtonType.BUTTON,
      variant: 'primary',
      wide: true,
      step,
      onClick: () => setKey(key + 1),
    }
  };

  return (
    <React.Fragment>
      <Button uischema={buttonUiSchema} />
      {href && <IFrame key={key} src={href} />}
    </React.Fragment>
  );
};

export default OpenOktaVerifyButton;
