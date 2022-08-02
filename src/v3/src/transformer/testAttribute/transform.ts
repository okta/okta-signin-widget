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
import { TransformStepFnWithOptions, ButtonElement, ButtonType, TransformStepFn, FieldElement } from '../../types';
import { updateElementsInLayout } from '../util';

const updateFields: TransformStepFn = formbag => {
  const { uischema } = formbag;

  updateElementsInLayout({
    layout: uischema,
    updateFn: (element) => {
      const { options } = element as FieldElement;
      options.dataSe = options.inputMeta.name;
    },
    predicateFn: (element) => {
      const { type } = element as FieldElement;
      return type === 'Field';
    },
  });
  
  return formbag; 
};

const updateSubmitButton: TransformStepFn = formbag => {
  const { uischema } = formbag;

  updateElementsInLayout({
    layout: uischema,
    updateFn: (element) => {
      const { options } = element as ButtonElement;
      options.dataSe = 'submit';
      options.dataType = 'save';
    },
    predicateFn: (element) => {
      const { type, options } = element as ButtonElement;
      return type === 'Button' && options.type === ButtonType.SUBMIT;
    },
  });
  
  return formbag; 
};

const updateRegularButtons: TransformStepFn = formbag => {
  const { uischema } = formbag;

  const map: Record<string, string> = {
    'select-enroll-profile': 'enroll',
    'currentAuthenticator-recover': 'forgot-password',
    'currentAuthenticatorEnrollment-recover': 'forgot-password',
    'unlock-account': 'unlock',
    'cancel': 'cancel',
    'select-identify': 'back',
    'select-authenticator-authenticate': 'switchAuthenticator',
    'select-authenticator-enroll': 'switchAuthenticator',
  };

  updateElementsInLayout({
    layout: uischema,
    updateFn: (element) => {
      const { options } = element as ButtonElement;
      options.dataSe = map[options.step];
    },
    predicateFn: (element) => {
      const { type, options } = element as ButtonElement;
      return type === 'Button' && options.type === ButtonType.BUTTON;
    },
  });
  
  return formbag; 
};

export const transformTestAttribute: TransformStepFnWithOptions = (options) => (formbag) => {
  return flow(
    updateFields,
    updateSubmitButton,
    updateRegularButtons,
  )(formbag);
};
