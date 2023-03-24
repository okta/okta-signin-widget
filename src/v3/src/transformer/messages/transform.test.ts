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

import { OV_NMC_FORCE_UPGRADE_SERVER_KEY, OV_UV_ENABLE_BIOMETRIC_SERVER_KEY, OV_UV_RESEND_ENABLE_BIOMETRIC_SERVER_KEY } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { InfoboxElement, WidgetProps } from 'src/types';

import { OV_OVERRIDE_MESSAGE_KEY, transformMessages } from './transform';

describe('Enroll Authenticator Selector Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [];
  });

  it('should not update formBag when no messages exist in the transaction', () => {
    expect(transformMessages({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag)).toEqual(formBag);
  });

  it('should add simple message to formBag when messages in transaction are not to be customized', () => {
    transaction.messages = [
      {
        message: 'This is a standard message',
        class: 'ERROR',
        i18n: { key: 'some.standard.key' },
      },
    ];
    const updatedFormBag = transformMessages({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.class)
      .toBe('ERROR');
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.message)
      .toEqual({
        class: 'ERROR',
        i18n: { key: 'some.standard.key' },
        message: 'This is a standard message',
      });
  });

  it('should add title when fips compliance message key exists in transaction', () => {
    transaction.messages = [
      {
        message: 'Force FIPS compliance upgrade key ios message.',
        class: 'ERROR',
        i18n: { key: OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS },
      },
    ];
    const updatedFormBag = transformMessages({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.class)
      .toBe('ERROR');
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.message)
      .toEqual({
        class: 'ERROR',
        i18n: { key: 'oie.authenticator.app.non_fips_compliant_enrollment_device_incompatible' },
        message: 'oie.authenticator.app.non_fips_compliant_enrollment_device_incompatible',
        title: 'oie.okta_verify.enroll.force.upgrade.title',
      });
  });

  it('should add title when OV QR enroll biometrics key exists in transaction', () => {
    transaction.messages = [
      {
        message: 'OV Enroll Biometrics key message.',
        class: 'ERROR',
        i18n: { key: OV_OVERRIDE_MESSAGE_KEY.OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY },
      },
    ];
    const updatedFormBag = transformMessages({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.class)
      .toBe('ERROR');
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.message)
      .toEqual({
        class: 'ERROR',
        i18n: { key: 'oie.authenticator.app.method.push.enroll.enable.biometrics' },
        message: 'oie.authenticator.app.method.push.enroll.enable.biometrics',
        title: 'oie.authenticator.app.method.push.enroll.enable.biometrics.title',
      });
  });

  it('should add title when messages contains "oie.authenticator.app.method.push.force.upgrade.number_challenge" key', () => {
    transaction.messages = [
      {
        message: 'OV push force upgrade number challenge message.',
        class: 'ERROR',
        i18n: { key: OV_NMC_FORCE_UPGRADE_SERVER_KEY },
      },
    ];
    const updatedFormBag = transformMessages({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.class)
      .toBe('ERROR');
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.message)
      .toEqual({
        class: 'ERROR',
        i18n: { key: OV_NMC_FORCE_UPGRADE_SERVER_KEY },
        message: OV_NMC_FORCE_UPGRADE_SERVER_KEY,
        title: 'oie.numberchallenge.force.upgrade.title',
      });
  });

  it('should add message list when biometrics error key for totp exists in transaction', () => {
    transaction.messages = [
      {
        message: 'This is a biometrics compatibility error.',
        class: 'ERROR',
        i18n: { key: OV_UV_ENABLE_BIOMETRIC_SERVER_KEY },
      },
    ];
    const updatedFormBag = transformMessages({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.class)
      .toBe('ERROR');
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.message)
      .toEqual({
        class: 'ERROR',
        message: [
          { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point1' },
          { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point2' },
          { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point3' },
        ],
        description: 'oie.authenticator.app.method.push.verify.enable.biometrics.description',
        title: 'oie.authenticator.app.method.push.verify.enable.biometrics.title',
      });
  });

  it('should add message list when biometrics error key for resend exists in transaction', () => {
    transaction.messages = [
      {
        message: 'This is a biometrics compatibility error.',
        class: 'ERROR',
        i18n: { key: OV_UV_RESEND_ENABLE_BIOMETRIC_SERVER_KEY },
      },
    ];
    const updatedFormBag = transformMessages({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.class)
      .toBe('ERROR');
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.message)
      .toEqual({
        class: 'ERROR',
        message: [
          { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point1' },
          { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point2' },
          { class: 'INFO', message: 'oie.authenticator.app.method.push.verify.enable.biometrics.point3' },
        ],
        description: 'oie.authenticator.app.method.push.verify.enable.biometrics.description',
        title: 'oie.authenticator.app.method.push.verify.enable.biometrics.title',
      });
  });
});
