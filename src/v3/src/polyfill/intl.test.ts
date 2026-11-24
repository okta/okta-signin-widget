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

describe('Intl polyfill', () => {
  const originalIntl = Object.getOwnPropertyDescriptor(window, 'Intl') as PropertyDescriptor;

  // Mimics EdgeHTML when its Intl initialization fails (OKTA-1325408):
  // the first access throws, later accesses return an empty object.
  const simulateBrokenEdgeHtmlIntl = () => {
    let tripped = false;
    const emptyIntl = {};
    Object.defineProperty(window, 'Intl', {
      configurable: true,
      get() {
        if (!tripped) {
          tripped = true;
          throw new Error('Intl is not available.');
        }
        return emptyIntl;
      },
      set(value) {
        Object.defineProperty(window, 'Intl', {
          configurable: true, writable: true, value,
        });
      },
    });
  };

  beforeEach(() => {
    jest.resetModules();
    simulateBrokenEdgeHtmlIntl();
  });

  afterEach(() => {
    Object.defineProperty(window, 'Intl', originalIntl);
  });

  it('throws without the guard', () => {
    expect(() => {
      jest.isolateModules(() => {
        // eslint-disable-next-line global-require
        require('@formatjs/intl-getcanonicallocales/polyfill');
      });
    }).toThrow('Intl is not available.');
  });

  it('loads and installs working formatters when first Intl access throws', () => {
    expect(() => {
      jest.isolateModules(() => {
        // eslint-disable-next-line global-require
        require('./intl');
      });
    }).not.toThrow();

    expect(typeof Intl.getCanonicalLocales).toBe('function');
    expect(new Intl.PluralRules('en').select(1)).toBe('one');
    expect(new Intl.NumberFormat('en').format(1234.5)).toBe('1,234.5');
    expect(new Intl.DateTimeFormat('en', {
      timeZone: 'America/Vancouver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(Date.UTC(2026, 0, 2, 12)))).toBe('01/02/2026');
    // DateTimeFormat polyfill swallows errors in toLocaleString and returns 'Invalid Date'
    // when PluralRules is missing (used by the device assurance grace period message)
    expect(new Date(Date.UTC(2026, 8, 5, 3)).toLocaleString(['en-US'], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC',
    })).toBe('09/05/2026');
  });
});
