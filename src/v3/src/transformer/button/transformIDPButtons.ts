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

import { IDX_STEP } from '../../constants';
import {
  DividerElement,
  TransformStepFnWithOptions,
} from '../../types';
import { getFastPassButtonElement, getIdpButtonElements, loc } from '../../util';

export const transformIDPButtons: TransformStepFnWithOptions = ({
  transaction,
  widgetProps,
}) => (
  formbag,
) => {
  const { neededToProceed: remediations } = transaction;
  const containsIdentifyStep = remediations.some(
    (remediation) => remediation.name === IDX_STEP.IDENTIFY,
  );
  const containsEnrollProfileStep = remediations.some(
    (remediation) => remediation.name === IDX_STEP.ENROLL_PROFILE,
  );

  // must be on identify or enroll profile page to display Idp buttons
  if (!(containsIdentifyStep || containsEnrollProfileStep)) {
    return formbag;
  }

  const fastPassButtonElement = getFastPassButtonElement(transaction);
  const idpButtonElements = getIdpButtonElements(transaction, widgetProps);
  const buttonsToAdd = [...fastPassButtonElement, ...idpButtonElements];
  if (buttonsToAdd.length < 1) {
    return formbag;
  }

  const dividerElement: DividerElement = {
    type: 'Divider',
    options: { text: loc('socialauth.divider.text', 'login') },
  };

  // show IDP buttons on the bottom for enroll profile flow
  if (containsEnrollProfileStep) {
    const firstLinkIndex = formbag.uischema.elements.findIndex((element) => element.type === 'Link');
    const firstButtonIndex = formbag.uischema.elements.findIndex((element) => element.type === 'Button');
    const firstButtonPos = firstButtonIndex !== -1 ? firstButtonIndex + 1 : 0;
    const insertPos = firstLinkIndex !== -1 ? firstLinkIndex : firstButtonPos;
    // Add buttons after login form but before links (if any exists)
    formbag.uischema.elements.splice(insertPos, 0, dividerElement, ...buttonsToAdd);
  } else {
    // Currently in G3 we are locking Idp buttons to the top of the identify flow
    const titleIndex = formbag.uischema.elements.findIndex((element) => element.type === 'Title');
    const insertPos = titleIndex !== -1 ? titleIndex + 1 : 0;
    // Add buttons after title (if exists) otherwise add to top of array
    formbag.uischema.elements.splice(insertPos, 0, ...buttonsToAdd, dividerElement);
  }

  return formbag;
};
