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

import { WidgetProps } from '../../types';
import { triggerEmailVerifyCallback } from '.';

describe('idx/triggerEmailVerifyCallback', () => {
  let widgetProps: WidgetProps;
  let mockAuthClient: any;
  const otp = 'fake-otp';

  beforeEach(() => {
    mockAuthClient = {
      idx: {
        proceed: jest.fn(),
        getSavedTransactionMeta: jest.fn(),
      },
    };
    widgetProps = {
      authClient: mockAuthClient,
      otp,
    } as unknown as WidgetProps;
  });

  describe('if there is an interactionHandle in storage', () => {
    beforeEach(() => {
      const interactionHandle = 'fake-interactionHandle';
      jest.spyOn(mockAuthClient.idx, 'getSavedTransactionMeta').mockResolvedValue({ interactionHandle });
    });

    it('should pass the otp from settings to idx.proceed()', async () => {
      jest.spyOn(mockAuthClient.idx, 'proceed');
      await triggerEmailVerifyCallback(widgetProps);
      expect(mockAuthClient.idx.proceed).toHaveBeenCalledWith({
        exchangeCodeForTokens: false,
        otp,
      });
    });
    it('should return an idx response from idx.proceed', async () => {
      const idxResponse = { fake: true };
      jest.spyOn(mockAuthClient.idx, 'proceed').mockResolvedValue(idxResponse);
      const res = await triggerEmailVerifyCallback(widgetProps);
      expect(mockAuthClient.idx.proceed).toHaveBeenCalledWith({
        exchangeCodeForTokens: false,
        otp,
      });
      expect(res).toBe(idxResponse);
    });
  });

  it('should return an idx response with a terminal message if there is no interactionHandle in storage', async () => {
    jest.spyOn(mockAuthClient.idx, 'getSavedTransactionMeta').mockResolvedValue({});
    jest.spyOn(mockAuthClient.idx, 'proceed');
    const { messages } = await triggerEmailVerifyCallback(widgetProps);
    expect(mockAuthClient.idx.proceed).not.toHaveBeenCalled();
    expect(messages).toBeInstanceOf(Array);
    expect(messages).toHaveLength(1);
    expect(messages![0].i18n.key).toEqual('idx.enter.otp.in.original.tab');
  });

  it('should return an idx response with a terminal message if storage is null', async () => {
    jest.spyOn(mockAuthClient.idx, 'getSavedTransactionMeta').mockResolvedValue(null);
    jest.spyOn(mockAuthClient.idx, 'proceed');
    const { messages } = await triggerEmailVerifyCallback(widgetProps);
    expect(mockAuthClient.idx.proceed).not.toHaveBeenCalled();
    expect(messages).toBeInstanceOf(Array);
    expect(messages).toHaveLength(1);
    expect(messages![0].i18n.key).toEqual('idx.enter.otp.in.original.tab');
  });
});
