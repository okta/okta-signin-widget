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
  ControlElement,
  ControlProps,
} from '@jsonforms/core';
import { FunctionComponent, h } from 'preact';
import { ClickHandler, WithDefaultValue } from 'src/types';

const AuthenticatorButton: FunctionComponent<ControlProps> = ({
  handleChange,
  path,
  uischema,
  config,
}) => {
  // get value from uischema
  const value = (uischema as ControlElement & WithDefaultValue).default;
  if (typeof config.onSubmit !== 'function') {
    throw new Error('config.onSubmit is required');
  }

  // FIXME race condition causes onSubmit handler to use stale data
  // https://oktainc.atlassian.net/browse/OKTA-427839
  const onClick: ClickHandler = (event) => {
    event.preventDefault();
    handleChange(path, value);
    config.onSubmit();
  };

  return (
    <button
      type="submit"
      onClick={onClick}
      value={JSON.stringify(value)}
    >
      { uischema.label ?? 'Submit' }
    </button>
  );
};

export default AuthenticatorButton;
