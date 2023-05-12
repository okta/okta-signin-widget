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

// TODO: OKTA-564568 Link exported from ODY does not have the focus() function and breaks autofocus
import { Link as LinkMui } from '@mui/material';
import { h } from 'preact';

import { useWidgetContext } from '../../contexts';
import { useAutoFocus, useOnSubmit } from '../../hooks';
import { ClickHandler, LinkElement, UISchemaElementComponent } from '../../types';

const Link: UISchemaElementComponent<{
  uischema: LinkElement
}> = ({ uischema }) => {
  const widgetContext = useWidgetContext();
  const {
    loading,
  } = widgetContext;
  const {
    focus,
    ariaDescribedBy,
    options: {
      label,
      href,
      target,
      dataSe,
      actionParams,
      isActionStep,
      step,
      target,
      onClick: onClickHandler,
    },
  } = uischema;
  const onSubmitHandler = useOnSubmit();
  const focusRef = useAutoFocus<HTMLAnchorElement>(focus);

  const onClick: ClickHandler = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (typeof onClickHandler !== 'undefined') {
      onClickHandler(widgetContext);
      return;
    }

    onSubmitHandler({
      params: actionParams,
      isActionStep,
      step,
    });
  };

  return (
    typeof href === 'undefined' ? (
      <LinkMui
        component="button"
        variant="body1"
        role="link"
        onClick={onClick}
        aria-describedby={ariaDescribedBy}
        ref={focusRef}
        data-se={dataSe}
        sx={{
          '&:hover': {
            cursor: 'pointer',
          },
          verticalAlign: 'baseline',
        }}
      >
        {label}
      </LinkMui>
    )
      : (
        <LinkMui
          href={href}
          target={target}
          ref={focusRef}
          aria-describedby={ariaDescribedBy}
          data-se={dataSe}
          target={target}
        >
          {label}
        </LinkMui>
      )
  );
};

export default Link;
