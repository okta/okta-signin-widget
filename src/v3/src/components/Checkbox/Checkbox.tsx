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

import { Checkbox as CheckboxMui, FormControlLabel } from '@mui/material';
import { h } from 'preact';
import { ChangeEvent, FieldElement, UISchemaElementComponent } from 'src/types';

import { useOnChange, useValue } from '../../hooks';
import { useTranslation } from '../../lib/okta-i18n';
import { getLabelName } from '../helpers';

const Checkbox: UISchemaElementComponent<{
  uischema: FieldElement
}> = ({ uischema }) => {
  const { t } = useTranslation();
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);

  const {
    name,
    label,
  } = uischema.options.inputMeta;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeHandler(e.currentTarget.checked);
  };

  return (
    <FormControlLabel
      control={(
        <CheckboxMui
          size="medium"
          checked={value === true}
          id={name}
          name={name}
          onChange={handleChange}
          inputProps={{
            'data-se': name,
          }}
        />
      )}
      label={t(getLabelName(label as string))}
    />
  );
};

export default Checkbox;
