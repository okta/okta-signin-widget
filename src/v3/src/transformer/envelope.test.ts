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

import { IdxRemediation } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { transformer } from 'src/transformer/envelope';
import { FormEnvelope } from 'src/types';

describe('"envelope" remediation transformer', () => {
  it('should copy envelope data from ION formdfield', () => {
    const formfield: IdxRemediation = {
      name: 'identify',
      href: 'http://localhost:3000/idp/idx/identify',
      method: 'POST',
      accepts: 'application/vnd.okta.v1+json',
    };

    const result: { envelope: FormEnvelope } = {
      envelope: {
        name: 'identify',
        href: 'http://localhost:3000/idp/idx/identify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.okta.v1+json',
        },
      },
    };
    expect(transformer(formfield)).toEqual(result);
  });
});
