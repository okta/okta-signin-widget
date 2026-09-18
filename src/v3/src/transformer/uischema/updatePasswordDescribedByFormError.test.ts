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

import { getStubFormBag } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  InfoboxElement,
  TitleElement,
  UISchemaElement,
} from 'src/types';

import {
  FORM_ERROR_MESSAGE_ID,
  updatePasswordDescribedByFormError,
} from './updatePasswordDescribedByFormError';

const errorInfobox = (): InfoboxElement => ({
  type: 'InfoBox',
  options: {
    class: 'ERROR',
    message: { message: 'Unable to sign in' },
    dataSe: 'callout',
  },
} as InfoboxElement);

const passwordField = (): FieldElement => ({
  type: 'Field',
  options: { inputMeta: { name: 'credentials.passcode', secret: true } },
} as FieldElement);

describe('updatePasswordDescribedByFormError Tests', () => {
  let formBag: FormBag;

  beforeEach(() => {
    // Mirrors the identifier-first challenge-authenticator view: a single password field
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      errorInfobox(),
      { type: 'Title', id: 'title_1', options: { content: 'Verify with your password' } } as TitleElement,
      passwordField(),
      { type: 'Button', id: 'button_1', options: { type: ButtonType.SUBMIT } } as ButtonElement,
    ];
  });

  const describedByOf = (bag: FormBag, index: number) => (
    (bag.uischema.elements[index] as UISchemaElement).ariaDescribedBy
  );

  it('should associate the lone password field with the form-level error', () => {
    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    expect(describedByOf(updatedFormBag, 2)).toBe(FORM_ERROR_MESSAGE_ID);
  });

  it('should append to an existing aria-describedby value rather than replace it', () => {
    (formBag.uischema.elements[2] as UISchemaElement).ariaDescribedBy = 'PasswordRequirements_abc123';

    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    expect(describedByOf(updatedFormBag, 2))
      .toBe(`PasswordRequirements_abc123 ${FORM_ERROR_MESSAGE_ID}`);
  });

  it('should not associate any field when the view renders more than one field', () => {
    // The combined username + password sign-in form: a failed credential check is not
    // attributable to a single field, so neither field is associated with the error.
    formBag.uischema.elements = [
      errorInfobox(),
      { type: 'Field', options: { inputMeta: { name: 'identifier' } } } as FieldElement,
      passwordField(),
      { type: 'Field', options: { inputMeta: { name: 'rememberMe' } } } as FieldElement,
    ];

    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    expect(describedByOf(updatedFormBag, 1)).toBeUndefined();
    expect(describedByOf(updatedFormBag, 2)).toBeUndefined();
    expect(describedByOf(updatedFormBag, 3)).toBeUndefined();
  });

  it('should not associate the field when there is no form-level error', () => {
    formBag.uischema.elements = formBag.uischema.elements.filter(
      (element) => element.type !== 'InfoBox',
    );

    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    expect(describedByOf(updatedFormBag, 1)).toBeUndefined();
  });

  it('should not associate the field when the form-level message is not an error', () => {
    (formBag.uischema.elements[0] as InfoboxElement).options.class = 'WARNING';

    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    expect(describedByOf(updatedFormBag, 2)).toBeUndefined();
  });

  it('should not associate the field when the lone field is not a password', () => {
    formBag.uischema.elements[2] = {
      type: 'Field',
      options: { inputMeta: { name: 'credentials.passcode' } },
    } as FieldElement;

    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    expect(describedByOf(updatedFormBag, 2)).toBeUndefined();
  });

  it('should not associate the field when there are multiple form-level errors', () => {
    formBag.uischema.elements.unshift(errorInfobox());

    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    expect(describedByOf(updatedFormBag, 3)).toBeUndefined();
  });

  it('should expose the message id on the error element so the reference resolves', () => {
    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    const errorElement = updatedFormBag.uischema.elements[0] as InfoboxElement;
    expect(errorElement.options.messageId).toBe(FORM_ERROR_MESSAGE_ID);
    expect(describedByOf(updatedFormBag, 2)).toContain(FORM_ERROR_MESSAGE_ID);
  });

  it('should not expose a message id when the guard does not match', () => {
    formBag.uischema.elements = formBag.uischema.elements.filter(
      (element) => element.type !== 'Field',
    );

    const updatedFormBag = updatePasswordDescribedByFormError(formBag);

    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options.messageId)
      .toBeUndefined();
  });
});
