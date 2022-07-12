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

import { Box, Button } from '@okta/odyssey-react';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { useTranslation } from '../../lib/okta-i18n';
import { FieldElement, InputTextElement, UISchemaElementComponent } from '../../types';
import InputText from '../InputText';

const InputPassword: UISchemaElementComponent<{
  uischema: FieldElement
}> = ({ uischema }) => {
  const [inputType, setInputType] = useState<'text' | 'password'>('password');
  const { t } = useTranslation();
  const togglePassword = () => (inputType === 'password' ? setInputType('text') : setInputType('password'));

  return (
    // @ts-ignore OKTA-471233
    <Box>
      {/* @ts-ignore OKTA-471233 */}
      <Box marginBottom="m">
        <InputText
          uischema={uischema as InputTextElement}
          type={inputType}
        />
      </Box>
      {/* <Button
        data-se="show-password"
        size="s"
        type="button"
        onclick={togglePassword}
      >
        {inputType === 'text' ? t('renderers.password.hidePassword') : t('renderers.password.showPassword')}
      </Button> */}
    </Box>
  );
};

export default InputPassword;
