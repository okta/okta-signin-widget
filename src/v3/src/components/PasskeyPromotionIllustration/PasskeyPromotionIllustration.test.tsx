/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
import {
  PasskeyPromotionIllustrationElement,
  UISchemaElementComponentProps,
} from 'src/types';

import PasskeyPromotionIllustration from './PasskeyPromotionIllustration';

type Props = UISchemaElementComponentProps & { uischema: PasskeyPromotionIllustrationElement; };

describe('PasskeyPromotionIllustration', () => {
  const props: Props = {
    uischema: {
      type: 'PasskeyPromotionIllustration',
      options: {},
    },
  };

  it('renders exactly one <svg> with the natural viewBox', () => {
    const { container } = render(<PasskeyPromotionIllustration {...props} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
    expect(svgs[0].getAttribute('viewBox')).toBe('0 0 350 126');
  });

  it('marks the illustration as decorative (aria-hidden, focusable="false")', () => {
    const { container } = render(<PasskeyPromotionIllustration {...props} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
  });

  it('renders the SVG paths using currentColor so brand color can cascade', () => {
    const { container } = render(<PasskeyPromotionIllustration {...props} />);
    // At least one path/circle should use currentColor as either fill or stroke —
    // that's the mechanism by which the Odyssey PalettePrimaryMain (customer brand)
    // reaches the illustration.
    const nodes = container.querySelectorAll('path, circle');
    const usesCurrentColor = Array.from(nodes).some((n) => (
      n.getAttribute('fill') === 'currentColor' || n.getAttribute('stroke') === 'currentColor'
    ));
    expect(usesCurrentColor).toBe(true);
  });
});
