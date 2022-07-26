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

import { IdxAuthenticator, IdxMessage, IdxTransaction } from "@okta/okta-auth-js";
import { getStubTransaction } from "src/mocks/utils/utils";
import { FieldElement, FormBag, UISchemaElement } from "src/types";
import { transactionMessageTransformer, uischemaLabelTransformer } from "./i18nTransformer";
import { createForm } from "./utils";


describe('i18nTransformer Tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;

  beforeEach(() => {
    transaction = getStubTransaction();
    formBag = createForm();
  });

  describe('uischemaLabelTransformer Tests', () => {
    it('should not perform updates on elements when formbag doesnt contain elements with an applicable label field or options', () => {
      const element: UISchemaElement = { type: 'Control' };
      formBag.uischema.elements = [element];
      
      uischemaLabelTransformer(transaction, formBag);
      
      expect(formBag.uischema.elements).toEqual([element]);
    });
  
    it('should update label for control elements that does not contain options', () => {
      transaction.nextStep = {
        name: 'identify',
      };
      formBag.uischema.elements = [
        { type: 'Control', label: 'SomeFakeLabel1', name: 'identifier', options: { inputMeta: { name: 'identifier' } } } as FieldElement,
        { type: 'Control', label: 'SomeFakeLabel2', name: 'credentials.passcode', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
      ];
      
      uischemaLabelTransformer(transaction, formBag);
      
      expect((formBag.uischema.elements[0] as FieldElement).label).toBe('primaryauth.username.placeholder');
      expect((formBag.uischema.elements[1] as FieldElement).label).toBe('primaryauth.password.placeholder');
    });
  
    it('should update label for control elements that contains options and authenticator key', () => {
      transaction.nextStep = {
        name: 'select-authenticator-enroll',
        inputs: [{
          name: 'authenticator',
          options: [{
            label: 'SomeFakeLabel',
            relatesTo: { key: 'okta_password' } as unknown as IdxAuthenticator,
            value: [{ name: 'methodType', value: 'password' }, { name: 'id', value: 'abc1234' }],
          }],
        }],
      };
      formBag.uischema.elements = [
        {
          type: 'Control',
          name: 'authenticator',
          options: {
            inputMeta: {
              name: 'authenticator',
              options: [{
                label: 'SomeFakeLabel',
                value: [{ name: 'methodType', value: 'password' }, { name: 'id', value: 'abc123' }],
                relatesTo: { key: 'okta_password' } as unknown as IdxAuthenticator,
              }],
            },
          },
        } as FieldElement,
      ];
      
      uischemaLabelTransformer(transaction, formBag);
      
      expect((formBag.uischema.elements[0] as FieldElement)
        .options.inputMeta.options?.[0].label).toBe('oie.password.label');
    });
  });

  describe('transactionMessageTransformer Tests', () => {
    it('should not perform any updates when transaction does not contain messages', () => {
      transactionMessageTransformer(transaction);

      expect(transaction.messages).toBeUndefined();
    });
  
    it('should update message property with translated key when transaction contains messages', () => {
      transaction.messages = [{
        message: 'Some incorrect message from server',
        i18n: { key: 'oie.tooManyRequests' },
      } as IdxMessage];
      transactionMessageTransformer(transaction);

      expect(transaction.messages[0].message).toBe('oie.tooManyRequests');
    });
  });
});
