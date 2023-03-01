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

import { Box, FormHelperText } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { buildErrorMessageIds } from '../../util';

type FieldErrorProps = {
  errors?: string[];
  fieldName: string;
};

const FieldErrorContainer: FunctionComponent<FieldErrorProps> = (props) => {
  const { fieldName, errors } = props;

  const buildElementId = (errorIndex: number): string => {
    const errorIdStr = errors
      ? buildErrorMessageIds(errors, fieldName)
      : '';
    return errorIdStr.split(' ')[errorIndex];
  };

  return (
    <Box>
      {errors?.map((error: string, index: number) => (
        <FormHelperText
          key={error}
          id={buildElementId(index)}
          role="alert"
          data-se={buildElementId(index)}
          error
          // TODO: OKTA-577905 - Temporary fix until we can upgrade to the latest version of Odyssey
          sx={{ textAlign: 'start' }}
        >
          {error}
        </FormHelperText>
      ))}
    </Box>
  );
};

export default FieldErrorContainer;
