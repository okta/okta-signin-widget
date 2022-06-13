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

// TODO: re-able ts-check
// @ts-nocheck
import { Box, Radio } from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';
import { ChangeEvent, Choice, ControlPropsWithFormValidationState } from 'src/types';

import { handleFormFieldBlur, handleFormFieldChange } from '../../../util';
import { getLabelName } from '../helpers';

const OneOfRadioControl: FunctionComponent<ControlPropsWithFormValidationState> = ({
  errors,
  path,
  data,
  label,
  options,
  uischema,
  visible,
  handleChange,
  dirty,
  setDirty,
  setPristine,
  setTouched,
  setUntouched,
}) => {
  const { t } = useTranslation();

  return visible ? (
    // @ts-ignore OKTA-471233
    <Box
      // TODO: remove this condition once this ticket is implemented in Odyssey OKTA-473829
      marginBottom={(dirty && errors) ? undefined : 'm'}
    >
      <Radio.Group
        error={dirty && errors}
        name={path}
        label={t(getLabelName(label))}
        id={uischema.scope}
        value={data || ''}
        onBlur={(e: ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          handleFormFieldBlur(setPristine, setTouched, setUntouched);
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          let { value } = e.target;

          console.log('on change:', path, e.target.value);

          try {
            value = JSON.parse(value);
          } catch {
            // do nothing
          }
          handleFormFieldChange(
            path,
            value,
            handleChange,
            setPristine,
            setUntouched,
            setTouched,
            setDirty,
          );
        }}
      >
        {
          options.map((item: Choice) => {
            const { value } = item;
            let v;
            if (typeof value === 'string') {
              v = value;
            } else {
              v = JSON.stringify(value);
            }
            return (
              <Radio.Button
                key={v}
                value={v}
                label={t(item.label)}
              />
            );
          })
        }
      </Radio.Group>
    </Box>
  ) : null;
};

export default OneOfRadioControl;
