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

import { Box, Button as OdyButton } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnSubmit } from '../../hooks';
import {
  ButtonElement,
  ClickHandler,
  UISchemaElementComponent,
} from '../../types';
import Spinner from '../Spinner';

const Button: UISchemaElementComponent<{
  uischema: ButtonElement
}> = ({
  uischema,
}) => {
  const widgetContext = useWidgetContext();
  const { loading } = widgetContext;
  const onSubmitHandler = useOnSubmit();
  const {
    label,
    focus,
    ariaDescribedBy,
    options: {
      type,
      ariaLabel,
      variant,
      wide,
      dataType,
      dataSe,
      actionParams,
      Icon,
      includeData,
      isActionStep,
      step,
      stepToRender,
      classes,
      disabled,
      onClick,
    },
  } = uischema;

  const ButtonImageIcon = typeof Icon === 'string' ? (
    <Box
      component="img"
      src={Icon}
      alt={label}
    />
  ) : Icon && (<Icon />);

  const focusRef = useAutoFocus<HTMLButtonElement>(focus);

  const customClickHandler = () => onClick?.(widgetContext);

  const handleClick: ClickHandler = async () => {
    onSubmitHandler({
      params: actionParams,
      includeData: Boolean(includeData),
      isActionStep,
      step,
      stepToRender,
    });
  };

  return (
    <OdyButton
      type={type}
      variant={variant ?? 'primary'}
      fullWidth={wide ?? true}
      ref={focusRef}
      disabled={loading || disabled}
      className={classes}
        // Fixes text overflow
      sx={{ display: 'flex', whiteSpace: 'normal' }}
      startIcon={loading ? <Spinner color="white" /> : ButtonImageIcon}
      aria-describedby={ariaDescribedBy}
      data-type={dataType}
      data-se={dataSe}
      aria-label={ariaLabel}
        // eslint-disable-next-line react/jsx-props-no-spreading
      {...(type !== 'submit' && { onClick: typeof onClick === 'function' ? customClickHandler : handleClick })}
    >
      {label}
    </OdyButton>
  );
};

export default Button;
