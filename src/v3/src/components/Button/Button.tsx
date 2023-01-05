/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Button as OdyButton, CircularProgress } from '@okta/odyssey-react-mui';
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
      onClick,
    },
  } = uischema;

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
      disabled={loading}
      className={classes}
      // Fixes text overflow
      sx={{ display: 'flex', whiteSpace: 'normal' }}
      startIcon={
        loading ? (
          <CircularProgress
            // TODO: OKTA-518793 - replace english string with key once created
            aria-label="Loading..."
            aria-valuetext="Loading..."
            sx={{ color: 'white' }}
          />
        ) : Icon && <Icon />
      }
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
