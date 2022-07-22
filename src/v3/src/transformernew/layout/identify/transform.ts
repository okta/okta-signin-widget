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
  ButtonElement,
  ButtonType,
  CustomLayout,
  FieldElement,
  TitleElement,
  UISchemaLayoutType,
} from '../../../types';

export const transformIdentify = (): CustomLayout => {
  const title: TitleElement = {
    type: 'Title',
    options: { content: 'primaryauth.title' },
  };

  return {
    type: UISchemaLayoutType.VERTICAL,
    elements: [
      title,
      {
        tester: (uischema) => (uischema as FieldElement).options?.inputMeta?.name === 'identifier',
      },
      {
        tester: (uischema) => (uischema as FieldElement).options?.inputMeta?.name === 'credentials.passcode',
      },
      {
        tester: (uischema) => (uischema as FieldElement).options?.inputMeta?.name === 'rememberMe',
      },
      {
        tester: (uischema) => uischema.type === 'Button' && (uischema as ButtonElement).options?.type === ButtonType.SUBMIT,
      },
      {
        tester: (uischema) => uischema.type === 'Button' && (uischema as ButtonElement).options?.step === 'currentAuthenticator-recover',
      },
      {
        tester: (uischema) => uischema.type === 'Button' && (uischema as ButtonElement).options?.step === 'unlock-account',
      },
      {
        tester: (uischema) => uischema.type === 'Button' && (uischema as ButtonElement).options?.step === 'select-enroll-profile',
      },
    ],
  };
};
