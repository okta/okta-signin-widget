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
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus, useOnSubmit } from '../../../../../hooks';
import Spinner from '../../../../Spinner';
import { RendererProps } from '@jsonforms/core';
import { ClickHandler } from '../../../../../types';
import { withJsonFormsRendererProps } from '@jsonforms/react';

const ButtonElement: FunctionComponent<RendererProps> = ({
  uischema,
}) => {
  const widgetContext = useWidgetContext();
  const { loading } = widgetContext;
  const onSubmitHandler = useOnSubmit();
  const {
    // label,
    // focus,
    // ariaDescribedBy,
    options: {
      /** Unused props */
      focus,
      type = 'submit',
      // ariaLabel,
      // variant,
      // wide,
      // dataType,
      // dataSe,
      actionParams,
      // Icon,
      // iconAlt,
      // includeData,
      // isActionStep,
      // step,
      // stepToRender,
      // classes,
      disabled,
      onClick,
      /* END */

      id,
      style,
      label,
      event,
      target,
      image,
    } = {},
  } = uischema;
  const STYLE_TO_VARIANT: Record<string, 'primary' | 'secondary'> = {
    primaryButton: 'primary',
    secondaryButton: 'secondary',
  };

  const ButtonImageIcon = typeof image !== 'undefined' && (
    <Box
      component="img"
      src={image.renditions.light}
      alt={image.altText.text}
      aria-hidden
    />
  );

  const focusRef = useAutoFocus<HTMLButtonElement>(focus);

  const customClickHandler = () => onClick?.(widgetContext);

  const handleClick: ClickHandler = async () => {
    onSubmitHandler({
      params: actionParams,
      includeData: target.includeData,
      step: target.value,
    });
  };

  return (
    <Box marginBottom={4}>
      <OdyButton
        type={type}
        variant={STYLE_TO_VARIANT[style] ?? 'primary'}
        fullWidth={true}
        ref={focusRef}
        disabled={loading || disabled}
        // className={classes}
        // Fixes text overflow
        sx={{ display: 'flex', whiteSpace: 'normal' }}
        startIcon={loading ? <Spinner color="white" /> : ButtonImageIcon}
        // aria-describedby={ariaDescribedBy}
        // data-type={dataType}
        data-se={id}
        // aria-label={ariaLabel}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(type !== 'submit' && { onClick: typeof onClick === 'function' ? customClickHandler : handleClick })}
      >
        {label.content.text}
      </OdyButton>
    </Box>
  );
};

export default withJsonFormsRendererProps(ButtonElement);
