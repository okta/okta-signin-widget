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
  Checkbox,
} from '@okta/odyssey-react';
import { FunctionComponent, h } from 'preact';
import { ChangeEvent, ControlPropsWithFormValidationState } from 'src/types';

import { handleFormFieldBlur, handleFormFieldChange } from '../../../util';
import { getLabelName } from '../helpers';

const CheckboxControl: FunctionComponent<ControlPropsWithFormValidationState> = ({
  path,
  handleChange,
  label,
  data = false,
  errors,
  dirty,
  setDirty,
  setPristine,
  setTouched,
  setUntouched,
}) => (
  // @ts-ignore OKTA-471233
  <Box
    // TODO: remove this condition once this ticket is implemented in Odyssey OKTA-473829
    marginBottom={(dirty && errors) ? undefined : 'm'}
  >
    <Checkbox
      label={getLabelName(label)}
      error={dirty && errors}
      checked={data}
      required={false}
      onBlur={(e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        handleFormFieldBlur(setPristine, setTouched, setUntouched);
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        handleFormFieldChange(
          path,
          e.target.checked,
          handleChange,
          setPristine,
          setUntouched,
          setTouched,
          setDirty,
        );
      }}
    />
  </Box>
);

export default CheckboxControl;
