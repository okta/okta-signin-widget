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

import { Box } from '@mui/material';
import { NativeSelect, TextInput } from '@okta/odyssey-react';
import get from 'lodash/get';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import CountryUtil from '../../../../util/CountryUtil';
import { getMessage } from '../../../../v2/ion/i18nTransformer';
import { useWidgetContext } from '../../contexts';
import { useOnChange, useOnValidate } from '../../hooks';
import { ChangeEvent, FieldElement, UISchemaElementComponent } from '../../types';
import { getTranslation } from '../../util';
import { getLabelName } from '../helpers';

const PhoneAuthenticator: UISchemaElementComponent<{
  uischema: FieldElement
}> = ({ uischema }) => {
  const {
    label,
    options: {
      translations = [],
      targetKey = '',
      inputMeta: {
        name: fieldName,
        // @ts-ignore expose type from auth-js
        messages = {},
      },
    },
  } = uischema;
  const error = messages?.value?.[0] && getMessage(messages.value[0]);

  const { data } = useWidgetContext();
  const countries = CountryUtil.getCountries() as Record<string, string>;
  const [phone, setPhone] = useState<string>('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  // Sets US as default code
  const [phoneCode, setPhoneCode] = useState(`+${CountryUtil.getCallingCodeForCountry('US')}`);
  const [extension, setExtension] = useState<string>('');
  const targetValue = get(data, targetKey);
  const showExtension = targetValue === 'voice';
  const onValidateHandler = useOnValidate(uischema);
  const onChangeHandler = useOnChange(uischema);

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

  useEffect(() => {
    onChangeHandler(formatPhone(phone, phoneCode, extension));
    onValidateHandler(setFieldError, phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneCode, phone, extension, showExtension]);

  const renderExtension = () => (
    showExtension && (
      <Box
        width={0.25}
      >
        <TextInput
          type="text"
          data-se="extension"
          name="extension"
          label={getTranslation(translations, 'extension')}
          value={extension}
          autocomplete="tel-extension"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setExtension(e.currentTarget.value);
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
        label={getTranslation(translations, 'country')}
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
          <TextInput
            type="tel"
            data-se={fieldName}
            error={error}
            name={fieldName}
            label={getLabelName(label as string)}
            id={fieldName}
            prefix={phoneCode}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(uischema.options?.attributes && uischema.options.attributes)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              // Set new phone value without phone code
              setPhone(e.currentTarget.value);
            }}
          />
        </Box>
        { renderExtension() }
      </Box>
    </Box>
  );
};

export default PhoneAuthenticator;
