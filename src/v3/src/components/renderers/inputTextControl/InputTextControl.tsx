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
  TextInput,
} from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';
import { ControlPropsWithFormValidationState } from 'src/types';
import { ChangeEvent } from 'src/types/handlers';

import { handleFormFieldBlur, handleFormFieldChange } from '../../../util';
import { getLabelName } from '../helpers';

const InputTextControl: FunctionComponent<ControlPropsWithFormValidationState> = (props) => {
  const {
    uischema,
    path,
    errors,
    handleChange,
    label,
    visible,
    data,
    dirty,
    setDirty,
    setPristine,
    setUntouched,
    setTouched,
  } = props;

  const { t } = useTranslation();

  return visible ? (
    // @ts-ignore OKTA-471233
    <Box
      // TODO: remove this condition once this ticket is implemented in Odyssey OKTA-473829
      marginBottom={(dirty && errors) ? undefined : 'm'}
    >
      <TextInput
        error={dirty && errors}
        type="text"
        name={path}
        value={data || ''}
        id={uischema.scope}
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
    </Box>
  ) : null;
};

export default InputTextControl;
