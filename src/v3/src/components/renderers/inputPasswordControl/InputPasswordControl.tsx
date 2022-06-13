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
  Box,
  Button,
  TextInput,
} from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import { ControlPropsWithFormValidationState } from 'src/types';
import { ChangeEvent } from 'src/types/handlers';

import { useTranslation } from '../../../lib/okta-i18n';
import { handleFormFieldBlur, handleFormFieldChange } from '../../../util';
import { getLabelName } from '../helpers';

const InputPasswordControl: FunctionComponent<ControlPropsWithFormValidationState> = (props) => {
  const {
    uischema,
    path,
    errors,
    handleChange,
    label,
    data,
    dirty,
    setDirty,
    setPristine,
    setUntouched,
    setTouched,
  } = props;
  const [inputType, setInputType] = useState<'text' | 'password'>('password');
  const { t } = useTranslation();
  const togglePassword = () => (inputType === 'password' ? setInputType('text') : setInputType('password'));

  const {
    options: {
      inputMeta: {
        messages = {},
      } = {},
    } = {},
  } = uischema;
  const error = t((messages.value || [])[0]?.i18n.key);

  return (
    // @ts-ignore OKTA-471233
    <Box
      // TODO: remove this condition once this ticket is implemented in Odyssey OKTA-473829
      marginBottom={(errors && dirty) ? undefined : 'm'}
    >
      <TextInput
        error={error}
        type={inputType}
        name={path}
        value={data || ''}
        id={uischema.scope}
        data-testid={uischema.scope}
        label={t(getLabelName(label))}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          handleFormFieldBlur(setPristine, setTouched, setUntouched);
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          handleFormFieldChange(
            path,
            e.target.value,
            handleChange,
            setPristine,
            setUntouched,
            setTouched,
            setDirty,
          );
        }}
      />
      <Button
        size="s"
        type="button"
        onclick={togglePassword}
      >
        {inputType === 'text' ? t('renderers.password.hidePassword') : t('renderers.password.showPassword')}
      </Button>
    </Box>
  );
};

export default InputPasswordControl;
