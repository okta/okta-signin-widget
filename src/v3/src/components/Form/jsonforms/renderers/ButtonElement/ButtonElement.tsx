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

import { RendererProps } from '@jsonforms/core';
import { withJsonFormsRendererProps } from '@jsonforms/react';
import { Box } from '@mui/material';
import { Button as OdyButton, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { useWidgetContext } from '../../../../../contexts';
import { useAutoFocus, useOnSubmit } from '../../../../../hooks';
import { ClickHandler } from '../../../../../types';
import Spinner from '../../../../Spinner';

const ButtonElement: FunctionComponent<RendererProps> = ({
  uischema,
}) => {
  const widgetContext = useWidgetContext();
  const { loading } = widgetContext;
  const onSubmitHandler = useOnSubmit();
  const tokens = useOdysseyDesignTokens();
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
      // dataType,
      // dataSe,
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

      wide,
      id,
      style,
      label,
      events,
      target,
      image,
    } = {},
  } = uischema;
  const STYLE_TO_VARIANT: Record<string, 'primary' | 'secondary'> = {
    PRIMARY_BUTTON: 'primary',
    SECONDARY_BUTTON: 'secondary',
  };

  const ButtonImageIcon = typeof image !== 'undefined' ? (
    <Box
      component="img"
      src={image.rendition.mainHref}
      alt={image.altText.text}
      aria-hidden
    />
  ) : undefined;

  const focusRef = useAutoFocus<HTMLButtonElement>(focus);

  const customClickHandler = () => onClick?.(widgetContext);

  const handleClick: ClickHandler = async () => {
    onSubmitHandler({
      params: events?.[0]?.action?.actionParams,
      includeData: events?.[0]?.action?.includeFormData,
      step: events?.[0]?.action?.step,
    });
  };

  return (
    <Box sx={{marginBlockEnd: tokens.Spacing3}}>
      <OdyButton
        type={type}
        label={label}
        variant={STYLE_TO_VARIANT[style] ?? 'primary'}
        isFullWidth={wide ?? true}
        ref={focusRef}
        isDisabled={loading || disabled}
        // className={classes}
        startIcon={loading ? <Spinner /> : ButtonImageIcon}
        // aria-describedby={ariaDescribedBy}
        // data-type={dataType}
        testId={id}
        // aria-label={ariaLabel}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(type !== 'submit' && { onClick: typeof onClick === 'function' ? customClickHandler : handleClick })}
      />
    </Box>
  );
};


const WrappedButtonElement = withJsonFormsRendererProps(ButtonElement);
export default WrappedButtonElement;
