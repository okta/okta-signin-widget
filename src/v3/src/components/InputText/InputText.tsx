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
  FormHelperText,
  InputBase,
  InputLabel,
  // OutlinedInput,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { h } from 'preact';

import { useAutoFocus, useOnChange, useValue } from '../../hooks';
import {
  ChangeEvent, UISchemaElementComponent, UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import { withFormValidationState } from '../hocs';

const CustomInput = styled(InputBase)(({ theme, error }) => ({
  // 'label + &': {
  //   marginTop: theme.spacing(3),
  // },
  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    // backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
    border: '1px solid #8c8c96',
    borderColor: error && '#da372c',
    fontSize: 16,
    width: '100%',
    padding: '10px 12px',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&:focus': {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: error ? '#640019' : theme.palette.primary.main,
    },
  },
}));

const InputText: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  type,
  uischema,
  setTouched,
  error,
  setError,
  onValidateHandler,
}) => {
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);
  const { translations = [], focus } = uischema;
  const label = getTranslation(translations);
  const hint = getTranslation(translations, 'hint');
  const {
    attributes,
    inputMeta: { name },
    dataSe,
  } = uischema.options;
  const focusRef = useAutoFocus<HTMLInputElement>(focus);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched?.(true);
    onChangeHandler(e.currentTarget.value);
    onValidateHandler?.(setError, e.currentTarget.value);
  };

  return (
    <Box>
      <InputLabel htmlFor={name}>{label}</InputLabel>
      { hint && <FormHelperText data-se={`${name}-hint`}>{hint}</FormHelperText> }
      {/* <OutlinedInput
        value={value}
        type={type || 'text'}
        id={name}
        name={name}
        error={error !== undefined}
        onBlur={() => {
          setTouched?.(true);
          onValidateHandler?.(setError);
        }}
        onChange={handleChange}
        fullWidth
        inputProps={{
          'data-se': dataSe,
          ...attributes,
        }}
        inputRef={focusRef}
      /> */}
      <CustomInput
        value={value}
        type={type || 'text'}
        id={name}
        name={name}
        error={error !== undefined}
        onBlur={() => {
          setTouched?.(true);
          onValidateHandler?.(setError);
        }}
        onChange={handleChange}
        fullWidth
        inputProps={{
          'data-se': dataSe,
          ...attributes,
        }}
        inputRef={focusRef}
      />
      {error && (
        <FormHelperText
          data-se={`${dataSe}-error`}
          error
        >
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default withFormValidationState(InputText);
