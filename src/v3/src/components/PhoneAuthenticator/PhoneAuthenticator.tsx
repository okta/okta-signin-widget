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
  NativeSelect,
  TextInput,
} from '@okta/odyssey-react';
import get from 'lodash/get';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ChangeEvent, FieldElement, UISchemaElementComponent } from 'src/types';

import { useWidgetContext } from '../../contexts';
import { useOnChange } from '../../hooks';
import { useTranslation } from '../../lib/okta-i18n';
import countryList from '../../mocks/countryList/countryList.json';
import { getLabelName } from '../helpers';
import countryCallingCodes from './countryCallingCodes';

const PhoneAuthenticator: UISchemaElementComponent<{
  uischema: FieldElement
}> = ({ uischema }) => {
  const { t } = useTranslation();
  const {
    label,
    name: fieldName,
    options: {
      targetKey = '',
    },
  } = uischema;

  const { data } = useWidgetContext();
  const countries = Object.entries(countryList);
  const [phone, setPhone] = useState<string>('');
  // Sets US as default code
  const [phoneCode, setPhoneCode] = useState(`+${countryCallingCodes.US}`);
  const [extension, setExtension] = useState<string>('');
  const labelText = t(getLabelName(label as string));
  const targetValue = get(data, targetKey);
  const showExtension = targetValue === 'voice';
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

  const renderExtension = () => (
    showExtension && (
      // @ts-ignore OKTA-471233
      <Box>
        <TextInput
          type="text"
          data-se="extension"
          name="extension"
          label={t('phone.extention.label')}
          value={extension}
          autocomplete="tel-extension"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setExtension(e.currentTarget.value);
          }}
        />
      </Box>
    )
  );

  useEffect(() => {
    onChangeHandler(formatPhone(phone, phoneCode, extension));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneCode, phone, extension, showExtension]);

  return (
    // @ts-ignore OKTA-471233
    <Box>
      {/* @ts-ignore OKTA-471233 */}
      <Box marginBottom="m">
        <NativeSelect
          id="countryList"
          data-se="countryList"
          label={t('country.label')}
          autocomplete="tel-country-code"
          onChange={(e: ChangeEvent) => { setPhoneCode(`+${countryCallingCodes[e.currentTarget.value]}`); }}
        >
          {
            countries.map(([code, name]) => (
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
      {/* @ts-ignore OKTA-471233 */}
      <Box
        display="flex"
        justifyContent="space-between"
      >
        {/* @ts-ignore OKTA-471233 */}
        <Box
          width="full"
          marginRight={showExtension && 'xs'}
        >
          <TextInput
            type="tel"
            data-se={fieldName}
            // error={error}
            name={fieldName}
            label={labelText}
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
