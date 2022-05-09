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

import { render } from '@testing-library/preact';
import { h } from 'preact';

import AuthHeader, { AuthHeaderProps } from './AuthHeader';

describe('AuthHeader tests', () => {
  let props: AuthHeaderProps;

  beforeEach(() => {
    props = {
      logo: '/img/socialButtonIcons/okta.svg',
      logoText: 'Mock Logo',
      brandName: 'Mock Company',
    };
  });

  it('should display brand logo only', async () => {
    const { container, findByAltText } = render(<AuthHeader {...props} />);

    expect(await findByAltText('Mock Logo')).toBeDefined();
    expect(container.querySelector('[src="/img/socialButtonIcons/okta.svg"]')).toBeDefined();
  });

  it('should display generic logo and no AuthCoin when logo & logoText are not provided', async () => {
    props = {};
    const { container, findByAltText } = render(<AuthHeader {...props} />);

    expect(await findByAltText('Logo')).toBeDefined();
    expect(container.querySelector('[src="/img/atko_brand_logo.svg"]')).toBeDefined();
  });

  it('should display brand logo with brand name as logo alt text when logoText is not provided', async () => {
    props = {
      logo: '/img/socialButtonIcons/okta.svg',
      brandName: 'Mock Company',
    };
    const { container, findByAltText } = render(<AuthHeader {...props} />);

    expect(await findByAltText('Mock Company')).toBeDefined();
    expect(container.querySelector('[src="/img/socialButtonIcons/okta.svg"]')).toBeDefined();
  });

  it('should display brand logo with generic name as logo alt text when neither brandName nor logoText are provided', async () => {
    props = {
      logo: '/img/socialButtonIcons/okta.svg',
    };
    const { container, findByAltText } = render(<AuthHeader {...props} />);

    expect(await findByAltText('Logo')).toBeDefined();
    expect(container.querySelector('[src="/img/socialButtonIcons/okta.svg"]')).toBeDefined();
  });

  it('should display brand logo and AuthCoin when authCoin data is provided', async () => {
    props = {
      logo: '/img/atko_brand_logo.svg',
      logoText: 'Atko Logo',
      authCoinProps: {
        authenticatorKey: 'duo',
      },
    };

    const { container, findByAltText } = render(<AuthHeader {...props} />);

    expect(await findByAltText('Atko Logo')).toBeDefined();
    expect(container.querySelector('[class="authCoin"]')).toBeDefined();
  });
});
