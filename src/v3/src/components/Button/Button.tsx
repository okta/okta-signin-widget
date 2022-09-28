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

import { Box, Button as ButtonMui, CircularProgress } from '@mui/material';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnSubmit } from '../../hooks';
import {
  ButtonElement,
  ClickHandler,
  UISchemaElementComponent,
} from '../../types';

const Button: UISchemaElementComponent<{
  uischema: ButtonElement
}> = ({
  uischema,
}) => {
  const {
    loading,
  } = useWidgetContext();
  const onSubmitHandler = useOnSubmit();
  const {
    label,
    focus,
    options: {
      type,
      ariaLabel,
      variant,
      wide,
      dataType,
      dataSe,
      actionParams,
      includeData,
      isActionStep,
      step,
      stepToRender,
    },
  } = uischema;

  const focusRef = useAutoFocus(focus);

  const onClick: ClickHandler = async () => {
    onSubmitHandler({
      params: actionParams,
      includeData: Boolean(includeData),
      isActionStep,
      step,
      stepToRender,
    });
  };

  return (
    <ButtonMui
      type={type}
      variant={variant ?? 'primary'}
      fullWidth={wide ?? true}
      ref={focusRef}
      disabled={loading}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(dataType && { 'data-type': dataType } )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(dataSe && { 'data-se': dataSe } )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(type !== 'submit' && { onClick })}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(ariaLabel && { 'aria-label': ariaLabel } )}
    >
      {
        loading ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            alignContent="space-between"
            gap="5px"
            // compensate the offset from the CircularProgress component
            marginRight="23px"
          >
            <CircularProgress
              // TODO: OKTA-518793 - replace english string with key once created
              aria-label="Loading..."
              aria-valuetext="Loading..."
              sx={{ color: 'white' }}
            />
            {label}
          </Box>
        ) : label
      }

    </ButtonMui>
  );
};

export default Button;
