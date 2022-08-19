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
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { NativeSelect } from '@okta/odyssey-react';
import { IdxMessage } from '@okta/okta-auth-js';
import { h } from 'preact';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'preact/hooks';

import CountryUtil from '../../../../util/CountryUtil';
import { useWidgetContext } from '../../contexts';
import { useOnChange } from '../../hooks';
import {
  ChangeEvent,
  FormBag,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { getTranslation } from '../../util';
import { withFormValidationState } from '../hocs';

const PhoneAuthenticator: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  setTouched,
  error,
  setError,
  onValidateHandler,
}) => {
  const { dataSchemaRef } = useWidgetContext();
  const {
    translations = [],
    options: {
      inputMeta: {
        name: fieldName,
        // @ts-ignore expose type from auth-js
        messages = {},
      },
      attributes,
      focus,
    },
  } = uischema;
  const mainLabel = getTranslation(translations!, 'label');
  const extensionLabel = getTranslation(translations!, 'extension');
  const countryLabel = getTranslation(translations!, 'country');

  const { data } = useWidgetContext();
  const countries = CountryUtil.getCountries() as Record<string, string>;
  const [phone, setPhone] = useState<string>('');
  // Sets US as default code
  const [phoneCode, setPhoneCode] = useState(`+${CountryUtil.getCallingCodeForCountry('US')}`);
  const [extension, setExtension] = useState<string>('');
  const methodType = data['authenticator.methodType'];
  const showExtension = methodType === 'voice';
  const onChangeHandler = useOnChange(uischema);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const formatPhone = (
    phoneNumber: string,
    code: string,
    ext: string,
  ): string => {
    if (showExtension && ext.trim()) {
      return `${code}${phoneNumber}x${ext}`;
    }
    return `${code}${phone}`;
  };

  const validate = useCallback((dataBag: FormBag['data']) => {
    const fullPhoneNumber = dataBag[fieldName];
    const errorMessage: IdxMessage = {
      class: 'ERROR',
      message: '',
      i18n: { key: 'model.validation.field.blank' },
    };
    const isValid = !!fullPhoneNumber && !!phone;
    return isValid ? undefined : [errorMessage];
  }, [phone, fieldName]);

  useEffect(() => {
    if (focus && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [focus, showExtension]);

  useEffect(() => {
    dataSchemaRef.current![fieldName].validate = validate;
  }, [dataSchemaRef, fieldName, messages.value, validate]);

  useEffect(() => {
    const formattedPhone = formatPhone(phone, phoneCode, extension);
    onChangeHandler(formattedPhone);
    onValidateHandler?.(setError, formattedPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneCode, phone, extension, showExtension]);

  const renderExtension = () => (
    showExtension && (
      <Box width={0.25}>
        <InputLabel htmlFor="phoneExtension">{extensionLabel}</InputLabel>
        <OutlinedInput
          value={extension}
          type="text"
          name="extension"
          id="phoneExtension"
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setExtension(e.currentTarget.value);
          }}
          inputProps={{
            'data-se': 'extension',
            autocomplete: 'tel-extension',
          }}
        />
      </Box>
    )
  );

  const renderCountrySelect = () => (
    <Box marginBottom={4}>
      <NativeSelect
        id="countryList"
        data-se="countryList"
        label={countryLabel}
        autocomplete="tel-country-code"
        onChange={(e: ChangeEvent) => { setPhoneCode(`+${CountryUtil.getCallingCodeForCountry(e.currentTarget.value)}`); }}
      >
        {
            Object.entries(countries).map(([code, name]) => (
              <NativeSelect.Option
                key={code}
                value={code}
                // Sets US as default code
                selected={code === 'US'}
              >
                {name}
              </NativeSelect.Option>
            ))
          }
      </NativeSelect>
    </Box>
  );

  return (
    <Box>
      { renderCountrySelect() }
      <Box
        display="flex"
        flexWrap="wrap"
      >
        <Box
          width={showExtension ? 0.7 : 1}
          marginRight={showExtension ? 2 : 0}
        >
          <InputLabel htmlFor={fieldName}>{mainLabel}</InputLabel>
          <OutlinedInput
            type="tel"
            name={fieldName}
            id={fieldName}
            error={error !== undefined}
            onBlur={() => {
              setTouched?.(true);
              onValidateHandler?.(setError);
            }}
            inputRef={firstInputRef}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              setTouched?.(true);
              // Set new phone value without phone code
              setPhone(e.currentTarget.value);
            }}
            startAdornment={(
              <InputAdornment
                component="span"
                position="start"
              >
                {phoneCode}
              </InputAdornment>
            )}
            fullWidth
            inputProps={{
              'data-se': fieldName,
              ...attributes,
            }}
          />
          {!!error && (
            <FormHelperText
              data-se={`${fieldName}-error`}
              error
            >
              {error}
            </FormHelperText>
          )}
        </Box>
        { renderExtension() }
      </Box>
    </Box>
  );
};

export default withFormValidationState(PhoneAuthenticator);
