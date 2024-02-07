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

import { Button as OdyButton } from '@okta/odyssey-react-mui';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnSubmit } from '../../hooks';
import {
  ButtonElement,
  ClickHandler,
  UISchemaElementComponent,
} from '../../types';
import Image from '../Image';
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
    noTranslate,
    options: {
      type,
      ariaLabel,
      variant,
      wide,
      dataType,
      dataSe,
      actionParams,
      Icon,
      iconAlt,
      includeData,
      isActionStep,
      step,
      stepToRender,
      disabled,
      onClick,
    },
  } = uischema;

  const ButtonImageIcon = typeof Icon === 'string' ? (
    <Image
      src={Icon}
      alt={iconAlt ?? ''}
      ariaHidden
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
      label={label ?? ''}
      type={type}
      variant={variant ?? 'primary'}
      isFullWidth={wide ?? true}
      buttonRef={focusRef}
      isDisabled={loading || disabled}
      startIcon={loading ? <Spinner /> : ButtonImageIcon}
      ariaDescribedBy={ariaDescribedBy}
      testId={dataSe ?? dataType}
      ariaLabel={ariaLabel}
      translate={noTranslate ? 'no' : undefined}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(type !== 'submit' && { onClick: typeof onClick === 'function' ? customClickHandler : handleClick })}
    />
  );
};

export default Button;
