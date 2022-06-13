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
import { FunctionComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ChangeEvent, ControlPropsAndContext } from 'src/types';

import { useTranslation } from '../../../lib/okta-i18n';
import countryList from '../../../mocks/countryList/countryList.json';
import { handleFormFieldBlur } from '../../../util';
import { getLabelName } from '../helpers';
import countryCallingCodes from './countryCallingCodes';

const PhoneAuthenticatorControl: FunctionComponent<ControlPropsAndContext> = (props) => {
  const {
    ctx,
    props: {
      uischema,
      path,
      handleChange,
      label,
      errors,
      dirty,
      setDirty,
      setPristine,
      setTouched,
      setUntouched,
    },
  } = props;
  const { t } = useTranslation();

  const countries = Object.entries(countryList);
  const [phone, setPhone] = useState<string>('');
  // Sets US as default code
  const [phoneCode, setPhoneCode] = useState(`+${countryCallingCodes.US}`);
  const [extension, setExtension] = useState<string>('');
  const labelText = t(getLabelName(label));
  const targetValue = get(ctx?.core?.data, uischema?.options?.targetKey);
  const showExtension = targetValue === 'voice' && uischema.options?.showExt;

  const handleFieldValidationChange = () => {
    setDirty?.(true);
    setPristine?.(false);
    setTouched?.(true);
    setUntouched?.(false);
  };

  const formatPhone = (
    phoneNumber: string,
    code: string,
    ext: string,
    showExt: boolean,
  ): string => {
    if (showExt && ext.trim()) {
      return `${code}${phoneNumber}x${ext}`;
    }
    return `${code}${phone}`;
  };

  const renderExtension = (): FunctionComponent => (
    showExtension && (
      // @ts-ignore OKTA-471233
      <Box>
        <TextInput
          type="text"
          name="extension"
          label={t('phone.extention.label')}
          value={extension}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setExtension(e.target.value);
          }}
        />
      </Box>
    )
  );

  useEffect(() => {
    handleChange(path, formatPhone(phone, phoneCode, extension, showExtension));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneCode, phone, extension, targetValue, uischema.options?.showExt, showExtension]);

  // TODO: ODY is working on prefix input element
  // see: https://okta.slack.com/archives/C7T2H3KNJ/p1646237360249409
  // Will need to implement once complete
  return (
    // @ts-ignore OKTA-471233
    <Box>
      {/* @ts-ignore OKTA-471233 */}
      <Box marginBottom="m">
        <NativeSelect
          id="countryList"
          label={t('country.label')}
          onChange={(e: ChangeEvent) => { setPhoneCode(`+${countryCallingCodes[e.target.value]}`); }}
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
        // TODO: remove this condition once this ticket is implemented in Odyssey OKTA-473829
        marginBottom={(dirty && errors) ? undefined : 'm'}
      >
        {/* @ts-ignore OKTA-471233 */}
        <Box
          width="full"
          marginRight={showExtension && 'xs'}
        >
          <TextInput
            type="tel"
            error={dirty && errors}
            name={path}
            label={labelText}
            value={phone}
            id={uischema.scope}
            onBlur={(e: ChangeEvent<HTMLInputElement>) => {
              e.preventDefault();
              handleFormFieldBlur(setPristine, setTouched, setUntouched);
            }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              e.preventDefault();
              handleFieldValidationChange();
              // Set new phone value without phone code
              setPhone(e.target.value);
            }}
          />
        </Box>
        { renderExtension() }
      </Box>
    </Box>
  );
};

export default PhoneAuthenticatorControl;
