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

import { flow } from 'lodash';

import {
  TransformStepFn,
  TransformStepFnWithOptions,
  UISchemaElement,
} from '../../types';
import { generateRandomString, isInteractiveType } from '../../util';
import { traverseLayout } from '../util';

const addKeyToElement: TransformStepFnWithOptions = ({ transaction }) => (formbag) => {
  traverseLayout({
    layout: formbag.uischema,
    predicate: (element) => !!element.type,
    callback: (element) => {
      const { nextStep: { name } = {} } = transaction;
      // We need Reminder Elements to unmount from view when new transaction
      // is set, this prevents this alert and error alerts from both displaying
      // at the same time
      if (element.type === 'Reminder') {
        // eslint-disable-next-line no-param-reassign
        element.key = `${name}_${generateRandomString()}`;
      } else {
        // eslint-disable-next-line no-param-reassign
        element.key = element.key ? `${name}_${element.key}` : name;
      }
    },
  });
  return formbag;
};

export const setFocusOnFirstElement: TransformStepFn = (formbag) => {
  let firstFieldFound = false;
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => (!firstFieldFound && isInteractiveType(el.type)),
    callback: (el) => {
      const uischemaElement = (el as UISchemaElement);
      uischemaElement.focus = true;
      firstFieldFound = true;
    },
  });
  return formbag;
};

export const transformUISchema: TransformStepFnWithOptions = (
  options,
) => (formbag) => flow(
  addKeyToElement(options),
  setFocusOnFirstElement,
)(formbag);
