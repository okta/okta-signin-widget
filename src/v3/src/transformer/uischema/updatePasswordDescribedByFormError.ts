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

import {
  FieldElement, InfoboxElement, TransformStepFn,
} from '../../types';
import { traverseLayout } from '../util';

/**
 * Id applied to the form-level error message when a password input references it. Namespaced
 * against the host page the widget is embedded in — a bare id such as "form-error" could
 * collide with the customer's own markup, which would make aria-describedby resolve to the
 * wrong element.
 */
export const FORM_ERROR_MESSAGE_ID = 'okta-sign-in-form-error';

/**
 * Associates a lone password input with a form-level error message via `aria-describedby`, so
 * that a screen reader user returning to the field is informed of the outstanding error. Without
 * this, the error is announced once by the `role="alert"` container and the field itself conveys
 * nothing on re-focus.
 *
 * Deliberately scoped to views that render exactly one field which is a password — i.e. the
 * identifier-first `challenge-authenticator` step. On views with several inputs, such as the
 * combined username + password sign-in form, a failed credential check is not attributable to
 * any single field, so no field is associated with the error.
 *
 * Note this adds a description only. It intentionally does not set `aria-invalid`, which per
 * WAI-ARIA asserts that "the value entered by the user has failed validation". The server
 * returns a generic form-level message and does not attribute the failure to a field, so the
 * widget does not either.
 */
export const updatePasswordDescribedByFormError: TransformStepFn = (formbag) => {
  const fieldElements: FieldElement[] = [];
  const errorElements: InfoboxElement[] = [];

  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => el.type === 'Field' || el.type === 'InfoBox',
    callback: (el) => {
      if (el.type === 'Field') {
        fieldElements.push(el as FieldElement);
      } else if ((el as InfoboxElement).options?.class === 'ERROR') {
        errorElements.push(el as InfoboxElement);
      }
    },
  });

  // Only the unambiguous case: a single password field and a single form-level error.
  if (fieldElements.length !== 1 || errorElements.length !== 1) {
    return formbag;
  }

  const [field] = fieldElements;
  const [errorElement] = errorElements;

  if (!field.options.inputMeta.secret) {
    return formbag;
  }

  errorElement.options.messageId = FORM_ERROR_MESSAGE_ID;
  field.ariaDescribedBy = typeof field.ariaDescribedBy === 'undefined'
    ? FORM_ERROR_MESSAGE_ID
    : `${field.ariaDescribedBy} ${FORM_ERROR_MESSAGE_ID}`;

  return formbag;
};
