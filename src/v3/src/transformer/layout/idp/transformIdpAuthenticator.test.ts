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

import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import {
  ButtonElement,
  DescriptionElement,
  RedirectElement,
  SpinnerElement,
  TitleElement,
  WidgetProps,
} from '../../../types';
import { transformIdpAuthenticator } from './transformIdpAuthenticator';

describe('IDP Authenticator transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  describe('IDP Authenticator Enroll tests', () => {
    beforeEach(() => {
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
        href: 'http://localhost:3000/sso/idps/mockedIdp123?stateToken=mockedStateToken124',
      };
      transaction.messages = [];
      widgetProps = {};
    });

    it('should add correct title, description, and button', () => {
      const updatedFormBag = transformIdpAuthenticator({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe('oie.idp.enroll.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.idp.enroll.description');
      expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
        .toBe('mfa.enroll');
    });

    it('should add title, description, spinner and auto-redirect '
      + 'when skipIdpFactorVerificationBtn feature is true', () => {
      widgetProps = {
        features: {
          skipIdpFactorVerificationBtn: true,
        },
      };
      const updatedFormBag = transformIdpAuthenticator({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe('oie.idp.enroll.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.idp.enroll.description');
      expect((updatedFormBag.uischema.elements[2] as SpinnerElement).type)
        .toBe('Spinner');
      expect((updatedFormBag.uischema.elements[3] as RedirectElement).options.url)
        .toBe('http://localhost:3000/sso/idps/mockedIdp123?stateToken=mockedStateToken124');
    });

    it('should not auto-redirect when skipIdpFactorVerificationBtn feature is true '
      + 'but there is an error in transaction', () => {
      widgetProps = {
        features: {
          skipIdpFactorVerificationBtn: true,
        },
      };
      transaction.messages = [
        {
          message: 'This is a standard message',
          class: 'ERROR',
          i18n: { key: 'some.standard.key' },
        },
      ];
      const updatedFormBag = transformIdpAuthenticator({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe('oie.idp.enroll.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.idp.enroll.description');
      expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
        .toBe('mfa.enroll');
    });
  });

  describe('IDP Authenticator verify tests', () => {
    beforeEach(() => {
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
        href: 'http://localhost:3000/sso/idps/mockedIdp123?stateToken=mockedStateToken124',
      };
      transaction.messages = [];
      widgetProps = {};
    });

    it('should add correct title, description, and button', () => {
      const updatedFormBag = transformIdpAuthenticator({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe('oie.idp.challenge.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.idp.challenge.description');
      expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
        .toBe('mfa.challenge.verify');
    });

    it('should add title, description, spinner and auto-redirect '
      + 'when skipIdpFactorVerificationBtn feature is true', () => {
      widgetProps = {
        features: {
          skipIdpFactorVerificationBtn: true,
        },
      };
      const updatedFormBag = transformIdpAuthenticator({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe('oie.idp.challenge.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.idp.challenge.description');
      expect((updatedFormBag.uischema.elements[2] as SpinnerElement).type)
        .toBe('Spinner');
      expect((updatedFormBag.uischema.elements[3] as RedirectElement).options.url)
        .toBe('http://localhost:3000/sso/idps/mockedIdp123?stateToken=mockedStateToken124');
    });

    it('should not auto-redirect when skipIdpFactorVerificationBtn feature is true '
      + 'but there is an error in transaction', () => {
      widgetProps = {
        features: {
          skipIdpFactorVerificationBtn: true,
        },
      };
      transaction.messages = [
        {
          message: 'This is a standard message',
          class: 'ERROR',
          i18n: { key: 'some.standard.key' },
        },
      ];
      const updatedFormBag = transformIdpAuthenticator({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(3);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe('oie.idp.challenge.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.idp.challenge.description');
      expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
        .toBe('mfa.challenge.verify');
    });
  });
});
