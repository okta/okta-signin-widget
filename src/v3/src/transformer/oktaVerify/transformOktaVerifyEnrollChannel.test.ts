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

import { IdxContext } from '@okta/okta-auth-js';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FieldElement,
  FormBag,
  TitleElement,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import * as channelTransformer from './transformOktaVerifyChannelSelection';
import { transformOktaVerifyEnrollChannel } from './transformOktaVerifyEnrollChannel';

describe('TransformOktaVerifyEnrollChannel Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  let formBag: FormBag;
  let channelSelectFormBag: FormBag;
  let channelTransformerStub: jest.SpyInstance;

  beforeEach(() => {
    formBag = {
      dataSchema: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      },
      data: {},
    };

    channelSelectFormBag = {
      dataSchema: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [{ type: 'Title', options: { content: 'Select a channel' } } as TitleElement],
      },
      data: {},
    };

    channelTransformerStub = jest.spyOn(
      channelTransformer,
      'transformOktaVerifyChannelSelection',
    ).mockReturnValue(channelSelectFormBag);
  });

  afterEach(() => {
    channelTransformerStub.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should append email input field to elements list when email is the selectedChannel', () => {
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'email' },
        },
      },
    } as unknown as IdxContext;
    formBag.uischema.elements.push({ type: 'Field', name: 'email' } as FieldElement);

    const updatedFormBag = transformOktaVerifyEnrollChannel({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should append phone input field to elements list when sms is the selectedChannel', () => {
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'sms' },
        },
      },
    } as unknown as IdxContext;
    formBag.uischema.elements.push({ type: 'Field', name: 'phoneNumber' } as FieldElement);

    const updatedFormBag = transformOktaVerifyEnrollChannel({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
  });
});
