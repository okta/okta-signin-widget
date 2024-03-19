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

import { setup } from './util';

import mockResponse from '../../../../playground/mocks/data/idp/idx/terminal-okta-verify-enrollment-android-device.json';
import Util from '../../../util/Util';

describe('terminal-okta-verify-enrollment-android-device', () => {
  it('should render form', async () => {
    jest.spyOn(Util, 'isAndroidOVEnrollment').mockReturnValue(true);
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/To continue, tap "Open Okta Verify"/);
    await findByText('Open Okta Verify', { selector: 'button' });
    expect(container).toMatchSnapshot();
  });
});
