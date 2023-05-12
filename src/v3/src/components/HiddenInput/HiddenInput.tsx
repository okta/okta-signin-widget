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

import classNames from 'classnames';
import { h } from 'preact';

import {
  HiddenInputElement,
  UISchemaElementComponent,
} from '../../types';
import style from './style.module.css';

const InputText: UISchemaElementComponent<{ uischema: HiddenInputElement }> = ({
  uischema,
}) => {
  const { name, value } = uischema.options;
  // Can't use hidden types otherwise browser plugins (i.e. Password Managers) will ignore
  const classes = classNames(style.hidden);

  return (
    <input
      type="text"
      className={classes}
      id={name}
      name={name}
      value={value}
    />
  );
};

export default InputText;
