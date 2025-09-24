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

import { IdxTransaction } from '@okta/okta-auth-js';
import { waitFor } from '@testing-library/preact';

import { getStubFormBag, getStubTransaction } from '../../mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  CaptchaContainerElement,
  DescriptionElement,
  FieldElement,
  FormBag,
  LinkElement,
  TitleElement,
  WidgetProps,
} from '../../types';
import { transformCaptcha } from './transformCaptcha';

describe('Captcha container transformer tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransaction();
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      { type: 'Field', options: { inputMeta: { name: 'identifier' } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
      { type: 'Button', options: { type: ButtonType.SUBMIT } } as ButtonElement,
      { type: 'Link', options: { label: 'Forgot Password' } } as LinkElement,
    ];
    widgetProps = {};
  });

  it('should add captcha container when captcha object is in transaction context', () => {
    transaction.context = {
      // @ts-expect-error OKTA-627610 captcha missing from context type
      captcha: {
        value: {
          type: 'RECAPTCHA_V2',
          id: 'test_id',
          siteKey: 'test_site_key',
        },
      },
    };
    const updatedFormBag = transformCaptcha({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect((updatedFormBag.uischema.elements[5] as CaptchaContainerElement).type).toBe('CaptchaContainer');
    expect((updatedFormBag.uischema.elements[5] as CaptchaContainerElement).options.type).toBe('RECAPTCHA_V2');
    expect((updatedFormBag.uischema.elements[5] as CaptchaContainerElement).options.captchaId).toBe('test_id');
    expect((updatedFormBag.uischema.elements[5] as CaptchaContainerElement).options.siteKey).toBe('test_site_key');
  });

  it('should not add captcha container when captcha object is not in transaction context', () => {
    const updatedFormBag = transformCaptcha({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toEqual(formBag);
  });

  it('should add footer text when captcha type is HCAPTCHA', () => {
    transaction.context = {
      // @ts-expect-error OKTA-627610 captcha missing from context type
      captcha: {
        value: {
          type: 'HCAPTCHA',
          id: 'test_id',
          siteKey: 'test_site_key',
        },
      },
    };
    const updatedFormBag = transformCaptcha({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[5] as DescriptionElement).options.content).toBe('hcaptcha.footer.label');
  });

  it('should not add footer text when captcha type is RECAPTCHA_V2', () => {
    transaction.context = {
      // @ts-expect-error OKTA-627610 captcha missing from context type
      captcha: {
        value: {
          type: 'RECAPTCHA_V2',
          id: 'test_id',
          siteKey: 'test_site_key',
        },
      },
    };
    const updatedFormBag = transformCaptcha({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect((updatedFormBag.uischema.elements[4] as DescriptionElement).options.content).not.toBe('hcaptcha.footer.label');
    expect(updatedFormBag).toEqual(formBag);
  });

  it('does not import altcha when captchaType is not ALTCHA', async () => {
    // Make importing 'altcha' throw if attempted
    jest.mock('altcha', () => {
      throw new Error('altcha should not be imported in this test');
    }, { virtual: true });

    jest.mock('../../contexts', () => ({
      useWidgetContext: () => ({
        // match the shape your CaptchaContainer expects (dataSchemaRef or dataSchema)
        dataSchemaRef: { current: {} },
        widgetProps: {},
      }),
    }));

    // Require after mocking so the mock takes effect
    const { h } = await import('preact');
    const { render } = await import('@testing-library/preact');
    const CaptchaModule = await import('../../components/CaptchaContainer/CaptchaContainer');
    const CaptchaContainer = CaptchaModule.default;

    const uischema = {
      type: 'CaptchaContainer',
      options: {
        type: 'RECAPTCHA_V2',
        siteKey: 'site-key',
        captchaId: 'test-id',
      },
    } as any;

    const { container } = render(h(CaptchaContainer, { uischema }));

    // Wait a tick to let effects run — if import was attempted it would have thrown
    await waitFor(() => {
      expect(container.querySelector('altcha-widget')).toBeNull();
    });
  });

  it('imports altcha when captchaType is ALTCHA', async () => {
    // Mock 'altcha' module so that importing it registers the web component
    jest.mock('altcha', () => {
      if (typeof window !== 'undefined' && window.customElements && !window.customElements.get('altcha-widget')) {
        class AltchaEl extends HTMLElement {}
        window.customElements.define('altcha-widget', AltchaEl);
      }
      return {};
    }, { virtual: true });

    jest.mock('../../contexts', () => ({
      useWidgetContext: () => ({
        // match the shape your CaptchaContainer expects (dataSchemaRef or dataSchema)
        dataSchemaRef: { current: {} },
        widgetProps: {},
      }),
    }));

    const { h } = await import('preact');
    const { render } = await import('@testing-library/preact');
    const CaptchaModule = await import('../../components/CaptchaContainer/CaptchaContainer');
    const CaptchaContainer = CaptchaModule.default;

    const uischema = {
      type: 'CaptchaContainer',
      options: {
        type: 'ALTCHA',
        siteKey: 'site-key',
        captchaId: 'alt_id',
      },
    } as any;

    const { container } = render(h(CaptchaContainer, { uischema }));

    // Wait for the component to load altcha and render the <altcha-widget>
    await waitFor(() => {
      expect(container.querySelector('altcha-widget')).not.toBeNull();
    });
  });
});
