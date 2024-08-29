/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxTransaction } from '@okta/okta-auth-js';
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  FormBag, InfoboxElement, TitleElement, WidgetProps,
} from 'src/types';
import { buildEndUserRemediationMessages } from 'src/util';

import { transformDeviceAssuranceGracePeriod } from './transformDeviceAssuranceGracePeriod';

describe('transformDeviceAssuranceGracePeriod Tests', () => {
  const transaction: IdxTransaction = getStubTransactionWithNextStep(IDX_STEP.SKIP);
  const widgetProps: WidgetProps = {};
  const formBag: FormBag = getStubFormBag();

  beforeEach(() => {
    transaction.messages = [
      {
        message: 'Your device doesn\'t meet the security requirements. Fix the issue within 1725667200000 days to prevent lockout.',
        i18n: {
          key: 'idx.device_assurance.grace_period.warning.title.due_by_days',
          params: [
            1725667200000,
          ],
        },
        class: 'ERROR',
      },
      {
        // @ts-expect-error OKTA-630508 links is missing from IdxMessage type
        links: [
          { url: 'https://okta.com/android-upgrade-os' },
        ],
        message: 'Update to Android 100',
        i18n: {
          key: 'idx.error.code.access_denied.device_assurance.remediation.android.upgrade_os_version',
          params: ['100'],
        },
        class: 'ERROR',
      },
      {
        // @ts-expect-error OKTA-630508 links is missing from IdxMessage type
        links: [
          { url: 'https://okta.com/help' },
        ],
        message: 'For more information, follow the instructions on the help page or contact your administrator for help',
        i18n: {
          key: 'idx.error.code.access_denied.device_assurance.remediation.additional_help_default',
        },
        class: 'ERROR',
      },
    ];
  });

  it('should build device assurance grace period view elements', () => {
    const updatedFormBag = transformDeviceAssuranceGracePeriod({
      transaction,
      formBag,
      widgetProps,
    });
    const remediationMessages = buildEndUserRemediationMessages(transaction.messages!);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toEqual('idx.device_assurance.grace_period.title');
    expect((updatedFormBag.uischema.elements[1] as InfoboxElement).options.message)
      .toEqual(remediationMessages);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toEqual('idx.device_assurance.grace_period.continue_to_app');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options.step)
      .toEqual(IDX_STEP.SKIP);
  });
});
