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

import { IDX_STEP } from '../../constants';
import {
  TransformStepFnWithOptions,
} from '../../types';
import { traverseLayout } from '../util';
import { addTranslation } from './util';

export const transformDuoWindow: TransformStepFnWithOptions = ({
  transaction,
}) => (
  formbag,
) => {
  const { uischema } = formbag;

  traverseLayout({
    layout: uischema,
    predicate: (element) => element.type === 'DuoWindow',
    callback: (element) => {
      const { nextStep: { name } = {} } = transaction;
      if (name === IDX_STEP.ENROLL_AUTHENTICATOR) {
        addTranslation({
          element,
          name: 'title',
          i18nKey: 'oie.duo.enroll.title',
        });
      } else {
        addTranslation({
          element,
          name: 'title',
          i18nKey: 'oie.duo.verify.title',
        });
      }
    },
  });

  return formbag;
};
