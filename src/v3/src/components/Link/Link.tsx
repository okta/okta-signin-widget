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

import { Link as LinkMui } from '@mui/material';
import { h } from 'preact';

import { useOnSubmit } from '../../hooks';
import { ClickHandler, LinkElement, UISchemaElementComponent } from '../../types';

const Link: UISchemaElementComponent<{
  uischema: LinkElement
}> = ({ uischema }) => {
  const {
    options: {
      label,
      href,
      dataSe,
      actionParams,
      isActionStep,
      step,
      onClick: onClickHandler,
    },
  } = uischema;
  const onSubmitHandler = useOnSubmit();
  // TO DO: https://oktainc.atlassian.net/browse/OKTA-527004
  // const focusRef = useAutoFocus<HTMLAnchorElement>(focus);

  const onClick: ClickHandler = async (e) => {
    e.preventDefault();

    onSubmitHandler({
      params: actionParams,
      isActionStep,
      step,
    });
  };
  const onMouseDown: ClickHandler = (e) => { e.preventDefault(); };

  return (
    typeof href === 'undefined' ? (
      <LinkMui
        // eslint-disable-next-line no-script-url
        href="javascript:void(0)"
        onClick={onClickHandler || onClick}
        onMouseDown={onMouseDown}
        // ref={focusRef}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(dataSe && { 'data-se': dataSe } )}
      >
        {label}
      </LinkMui>
    )
      : (
        <LinkMui
          href={href}
          onMouseDown={onMouseDown}
          // ref={focusRef}
        >
          {label}
        </LinkMui>
      )
  );
};

export default Link;
