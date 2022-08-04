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
  TransformStepFnWithOptions,
  TransformStepFn,
  FieldElement,
  ButtonElement,
  ButtonType, 
} from '../../types';
import { updateElementsInLayout } from '../util';
import { getAuthenticatorKey } from '../../util';
import { AUTHENTICATOR_KEY } from '../../constants';

const addValidation: TransformStepFnWithOptions = ({ transaction }) => formbag => {
  const currentAuthenticator = getAuthenticatorKey(transaction);
  if (transaction.nextStep?.name === 'enroll-authenticator' && currentAuthenticator === AUTHENTICATOR_KEY.SECURITY_QUESTION) {
    return formbag;
  }
  

  const { uischema, dataSchema } = formbag;

  updateElementsInLayout({
    layout: uischema,
    mapFn: (element) => {
      const { options: { inputMeta: { name } }} = element as FieldElement;
      dataSchema[name] = {
        validate(data) {
          const isValid = !!data[name];
          return isValid ? undefined : {
            i18n: {
              key: 'model.validation.field.blank',
            },
          };
        }
      };
      return element;
    },
    predicateFn: (element) => {
      const { 
        type, 
        options: {
          inputMeta: {
            required, mutable,
          } = {},
        } = {},
      } = element as FieldElement;
      
      // do not validate immutable fields, they will always be added to payload programatically
      return type === 'Field' && !!required && mutable !== false;
    },
  });

  return formbag;
};

const addSubmission: TransformStepFn = (formbag) => {

  const { uischema, dataSchema } = formbag;

  updateElementsInLayout({
    layout: uischema,
    mapFn: (element) => {
      const { options } = element as ButtonElement;
      dataSchema.submit = options;
      return element;
    },
    predicateFn: (element) => {
      const { type, options } = element as ButtonElement;
      return type === 'Button' && options.type === ButtonType.SUBMIT;
    },
  })

  return formbag;
}

export const transformDataSchema: TransformStepFnWithOptions = (options) => formbag => {
  return flow(
    // addValidation(options),
    addSubmission,
  )(formbag);
};
