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

import { h, render } from 'preact';

import OktaSignIn from '.';

import type { FunctionComponent } from 'preact';
import type { WidgetProps } from '../types';
import type { RenderResult } from '../../../types';

let onSuccessWrapper: (res: RenderResult) => void;
jest.mock('preact', () => {
  return {
    ...jest.requireActual<typeof import('preact')>('preact'),
    render: jest.fn(),
    h: jest.fn().mockImplementation((component: FunctionComponent<WidgetProps>, props: WidgetProps) => {
      // Extract the passsed globalSuccessFn prop so we can call it later to resolve the render promise
      onSuccessWrapper = props.globalSuccessFn ?? onSuccessWrapper;
    }),
  };
});

describe('OktaSignIn', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('id', 'test-container');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  it('should add translate="no" to the target element when renderEl is called', async () => {
    const options = {
      el: '#test-container',
      baseUrl: 'https://example.com',
      clientId: 'test-client-id',
      redirectUri: 'https://example.com/redirect',
    };

    const widget = new OktaSignIn(options);

    const renderResult: Promise<RenderResult> = widget.renderEl({
      el: '#test-container',
      clientId: 'test-client-id',
      redirectUri: 'https://example.com/redirect',
    });
    // Normally called by the Widget component but the component is mocked
    onSuccessWrapper({ status: 'SUCCESS' });

    await renderResult;

    expect(container.getAttribute('translate')).toBe('no');
    expect(render).toHaveBeenCalled();
  });

  it('should throw an error if the target element is not found', async () => {
    const options = {
      baseUrl: 'https://example.com',
      clientId: 'test-client-id',
      redirectUri: 'https://example.com/redirect',
    };

    const widget = new OktaSignIn(options);

    expect(widget.renderEl({
      el: '#non-existent',
      clientId: options.clientId,
      redirectUri: options.redirectUri,
    })).rejects.toThrow('could not find element #non-existent');
    expect(render).not.toHaveBeenCalled();
  });
});
