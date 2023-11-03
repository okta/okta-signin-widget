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

import { doesI18NKeyExist } from '../../../../v2/ion/i18nUtils';
import { IDX_STEP } from '../../constants';
import {
  FieldElement,
  TransformStepFnWithOptions,
} from '../../types';
import { traverseLayout } from '../util';
import { addTranslation } from './util';

export const transformGranularConsentFields: TransformStepFnWithOptions = ({
  transaction,
}) => (
  formbag,
) => {
  const { uischema } = formbag;
  const { nextStep: { name: stepName } = {} } = transaction;

  traverseLayout({
    layout: uischema,
    predicate: (element) => stepName === IDX_STEP.CONSENT_GRANULAR
      && element.type === 'Field'
      && (element as FieldElement).options.inputMeta.type === 'boolean',
    callback: (element) => {
      const fieldElement = element as FieldElement;
      const [prefixName, fieldName] = fieldElement.options.inputMeta.name.split('.');
      const defaultLabel = fieldElement.options.inputMeta.label || (fieldName ?? prefixName);
      const labelKey = `consent.scopes.${fieldName ?? prefixName}.label`;
      // If label has been added previously, must remove to overwrite.
      // eslint-disable-next-line no-param-reassign
      element.translations = element.translations?.filter(({ name }) => name !== 'label');
      addTranslation({
        element,
        name: 'label',
        i18nKey: doesI18NKeyExist(labelKey) ? labelKey : '',
        defaultValue: defaultLabel,
        // must add no-translate class to custom fields
        noTranslate: fieldName === 'openid' || !doesI18NKeyExist(labelKey),
      });

      const descrKey = `consent.scopes.${fieldName ?? prefixName}.desc`;
      // @ts-expect-error OKTA-598864 desc is missing from Input type
      const defaultDesc = fieldElement.options.inputMeta.desc;
      if (doesI18NKeyExist(descrKey) || typeof defaultDesc !== 'undefined') {
        addTranslation({
          element,
          name: 'description',
          i18nKey: doesI18NKeyExist(descrKey) ? descrKey : '',
          defaultValue: defaultDesc,
          // must add no-translate class to custom fields
          noTranslate: fieldName === 'openid' || !doesI18NKeyExist(labelKey),
        });
      }
    },
  });

  return formbag;
};
