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

import { groupBy } from 'lodash';

import { doesI18NKeyExist } from '../../../../../v2/ion/i18nUtils';
import { ConsentScopeGroup, SCOPE_GROUP_CONFIG } from '../../../constants';
import {
  ButtonElement,
  ButtonType,
  ConsentScope,
  DescriptionElement,
  FieldElement,
  HeadingElement,
  IdxStepTransformer,
} from '../../../types';
import { loc } from '../../../util';
import { removeUIElementWithName } from '../../utils';

const GROUP_KEY_TO_I18N_KEY: Record<ConsentScopeGroup, string> = {
  hook: 'admin.consent.group.hook',
  resource: 'admin.consent.group.resource.policy',
  system: 'admin.consent.group.system',
  user: 'admin.consent.group.user.group',
};

export const transformAdminConsent: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema, data } = formBag;
  const {
    nextStep: {
      name: stepName,
      // @ts-expect-error OKTA-599472 scopes array missing from NextStep type
      scopes,
    } = {},
  } = transaction;

  if (typeof stepName === 'undefined') {
    return formBag;
  }

  uischema.elements = removeUIElementWithName('consent', uischema.elements);

  const descriptionEle: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.consent.scopes.granular.description', 'login'),
      dataSe: 'consent-description',
    },
  };
  uischema.elements.push(descriptionEle);

  if (Array.isArray(scopes)) {
    const scopesByGroup = groupBy(scopes as ConsentScope[], (scope: ConsentScope) => {
      const [,groupKey] = scope.name.split('.');
      return SCOPE_GROUP_CONFIG[groupKey] ?? 'system';
    });

    Object.entries(scopesByGroup).forEach(([key, consentScopes]) => {
      const heading: HeadingElement = {
        type: 'Heading',
        noMargin: true,
        options: {
          level: 3,
          visualLevel: 6,
          content: loc(GROUP_KEY_TO_I18N_KEY[key as ConsentScopeGroup], 'login'),
          dataSe: 'scope-group--header',
        },
      };
      uischema.elements.push(heading);
      uischema.elements.push(...consentScopes.map((scope) => {
        const labelI18nKey = `consent.scopes.${scope.name}.label`;
        const descrI18nKey = `consent.scopes.${scope.name}.desc`;
        const isPredefinedLabel = doesI18NKeyExist(labelI18nKey);
        const isPredefinedDesc = doesI18NKeyExist(descrI18nKey);
        const label = isPredefinedLabel ? loc(labelI18nKey, 'login') : scope.label;
        const description = isPredefinedDesc
          ? loc(descrI18nKey, 'login')
          : scope.desc;
        const fieldName = `consent.scopes.${scope.name}`;
        data[fieldName] = true;
        return {
          type: 'Field',
          key: fieldName,
          translations: [
            {
              name: 'label',
              i18nKey: labelI18nKey,
              value: label,
              noTranslate: !isPredefinedLabel,
            },
            {
              name: 'description',
              i18nKey: descrI18nKey,
              value: description,
              noTranslate: !isPredefinedDesc,
            },
          ],
          options: {
            inputMeta: {
              name: fieldName,
              type: 'boolean',
              mutable: false,
            },
          },
        } as FieldElement;
      }));
    });
  }

  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('consent.required.consentButton', 'login'),
    options: {
      type: ButtonType.BUTTON,
      includeData: false,
      actionParams: { consent: true },
      step: stepName,
      dataType: 'save',
      variant: 'secondary',
    },
  };

  const cancelButton: ButtonElement = {
    type: 'Button',
    label: loc('oform.cancel', 'login'),
    options: {
      type: ButtonType.BUTTON,
      includeData: false,
      actionParams: { consent: false },
      step: stepName,
      dataType: 'cancel',
      variant: 'secondary',
    },
  };

  uischema.elements.push(submitButton);
  uischema.elements.push(cancelButton);

  return formBag;
};
