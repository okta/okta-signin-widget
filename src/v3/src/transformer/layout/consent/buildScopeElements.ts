/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { doesI18NKeyExist } from '../../../../../v2/ion/i18nTransformer';
import { DescriptionElement } from '../../../types';
import { loc } from '../../../util';

type Scope = {
  name: string;
  label: string;
  value: string;
  desc?: string;
};

export const buildScopeElements = (
  scopes?: Scope[],
): DescriptionElement[] | undefined => scopes?.map((scope) => {
  const i18nKey = `consent.scopes.${scope.name}.label`;
  const tooltipKey = `consent.scopes.${scope.name}.desc`;
  const isPredefinedLabel = doesI18NKeyExist(i18nKey);
  const content = isPredefinedLabel ? loc(i18nKey, 'login') : scope.label;
  const tooltip = doesI18NKeyExist(tooltipKey) ? loc(tooltipKey, 'login') : scope.desc;
  return {
    type: 'Description',
    noMargin: true,
    noTranslate: !isPredefinedLabel,
    options: {
      dataSe: 'scope-item-text',
      content,
      tooltip,
    },
  };
});
