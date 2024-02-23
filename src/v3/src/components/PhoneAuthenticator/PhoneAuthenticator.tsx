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

import { Box, SelectChangeEvent } from '@mui/material';
import { NativeSelect, TextField, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { IdxMessage } from '@okta/okta-auth-js';
import { h } from 'preact';
import {
  useCallback,
  useEffect,
  useState,
} from 'preact/hooks';

import CountryUtil from '../../../../util/CountryUtil';
import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnChange } from '../../hooks';
import {
  ChangeEvent,
  FormBag,
  UISchemaElementComponent,
  UISchemaElementComponentWithValidationProps,
} from '../../types';
import { buildFieldLevelErrorMessages, getDefaultCountryCode, getTranslation } from '../../util';
import { withFormValidationState } from '../hocs';

const PhoneAuthenticator: UISchemaElementComponent<UISchemaElementComponentWithValidationProps> = ({
  uischema,
  setTouched,
  errors,
  handleBlur,
}) => {
  const {
    data,
    dataSchemaRef,
    loading,
    widgetProps,
    languageDirection,
  } = useWidgetContext();
  const {
    translations = [],
    focus,
    options: {
      inputMeta: {
        name: fieldName,
        // @ts-ignore TODO: OKTA-539834 - messages missing from type
        messages = {},
        required,
      },
      attributes,
    },
  } = uischema;
  const { autocomplete, inputmode } = attributes || {};
  const mainLabel = getTranslation(translations, 'label');
  const extensionLabel = getTranslation(translations, 'extension');
  const countryLabel = getTranslation(translations, 'country');

  const { features: { disableAutocomplete } = {} } = widgetProps;
  const countries = CountryUtil.getCountries() as Record<string, string>;
  const [phone, setPhone] = useState<string>('');
  // Sets the default country code
  const defaultCountryCode = getDefaultCountryCode(widgetProps);
  const [phoneCode, setPhoneCode] = useState(`+${CountryUtil.getCallingCodeForCountry(defaultCountryCode)}`);
  const [extension, setExtension] = useState<string>('');
  const [phoneChanged, setPhoneChanged] = useState<boolean>(false);
  const methodType = data['authenticator.methodType'];
  const showExtension = methodType === 'voice';
  const onChangeHandler = useOnChange(uischema);
  const focusRef = useAutoFocus<HTMLSelectElement>(focus);
  const { errorMessage, errorMessageList } = buildFieldLevelErrorMessages(errors);
  const tokens = useOdysseyDesignTokens();

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
    const blankFieldErrorMessage: IdxMessage = {
      class: 'ERROR',
      message: '',
      i18n: { key: 'model.validation.field.blank' },
    };
    const isValid = !!fullPhoneNumber && !!phone;
    return isValid ? undefined : [blankFieldErrorMessage];
  }, [phone, fieldName]);

  useEffect(() => {
    if (dataSchemaRef.current) {
      dataSchemaRef.current[fieldName].validate = validate;
    }
  }, [dataSchemaRef, fieldName, messages.value, validate]);

  useEffect(() => {
    const formattedPhone = formatPhone(phone, phoneCode, extension);
    onChangeHandler(formattedPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneCode, phone, extension, showExtension]);

  useEffect(() => {
    if (phoneChanged) {
      setTouched?.(true);
    }
  }, [phoneChanged, setTouched]);

  const renderExtension = () => (
    showExtension && (
      <Box width={0.25}>
        <TextField
          autoCompleteType={disableAutocomplete ? 'off' : 'tel-extension'}
          id="phoneExtension"
          isDisabled={loading}
          label={extensionLabel ?? ''}
          name="extension"
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setExtension(e.currentTarget.value);
          }}
          testId="extension"
          value={extension}
        />
      </Box>
    )
  );

  const renderCountrySelect = () => (
    <Box marginBlockEnd={4}>
      <NativeSelect
        autoCompleteType={disableAutocomplete ? 'off' : 'tel-country-code'}
        id="country"
        inputRef={focusRef}
        isDisabled={loading}
        isOptional={required === false}
        label={countryLabel}
        onChange={(e: SelectChangeEvent<string>) => {
          const selectTarget = (
            e?.target as SelectChangeEvent['target'] & { value: string; name: string; }
          );
          setPhoneCode(`+${CountryUtil.getCallingCodeForCountry(selectTarget.value)}`);
        }}
        testId="country"
      >
        {
          Object.entries(countries).map(([code, name]) => (
            <option
              key={code}
              value={code}
              selected={code === defaultCountryCode}
            >
              {name}
            </option>
          ))
        }
      </NativeSelect>
    </Box>
  );

  return (
    <Box>
      {renderCountrySelect()}
      <Box
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        flexDirection={languageDirection === 'rtl' ? 'row-reverse' : 'row'}
      >
        <Box
          width={showExtension ? 0.7 : 1}
          sx={{
            marginRight: showExtension ? tokens.Spacing2 : tokens.Spacing0,
          }}
        >
          <TextField
            autoCompleteType={autocomplete}
            errorMessage={errorMessage}
            errorMessageList={errorMessageList}
            id={fieldName}
            inputMode={inputmode}
            isDisabled={loading}
            isFullWidth
            isOptional={required === false}
            label={mainLabel ?? ''}
            name={fieldName}
            onBlur={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              const formattedPhone = formatPhone(e?.currentTarget?.value, phoneCode, extension);
              handleBlur?.(formattedPhone);
            }}
            onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              // Set new phone value without phone code
              setPhone(e.currentTarget.value);
              setPhoneChanged(true);
            }}
            startAdornment={(
              <Box
                component="span"
                translate="no"
              >
                {phoneCode}
              </Box>
            )}
            testId={fieldName}
            type="tel"
          />
        </Box>
        {renderExtension()}
      </Box>
    </Box>
  );
};

const WrappedPhoneAuthenticator = withFormValidationState(PhoneAuthenticator);
export default WrappedPhoneAuthenticator;
