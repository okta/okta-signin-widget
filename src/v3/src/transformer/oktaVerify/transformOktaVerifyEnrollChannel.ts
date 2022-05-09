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

import { ControlElement, Layout, UISchemaElement } from '@jsonforms/core';
import merge from 'lodash/merge';

import { IDX_STEP } from '../../constants';
import {
  DescriptionElement,
  IdxStepTransformer,
  LayoutType,
  StepperLayout,
  StepperNavButtonConfigAttrs,
  StepperNavButtonConfigDirection,
} from '../../types';
import { ButtonOptionType } from '../getButtonControls';
import { getCurrentTimestamp, getUIElementWithScope, removeUIElementWithScope } from '../utils';
import { transformOktaVerifyChannelSelection } from './transformOktaVerifyChannelSelection';

const REORDER_SCOPES = ['#/properties/phoneNumber', '#/properties/email'];
const CHANNEL_TO_KEY_MAP: {
  title: { [channel: string]: string },
  description: { [channel: string]: string },
} = {
  description: {
    email: 'oie.enroll.okta_verify.channel.email.description',
    sms: 'oie.enroll.okta_verify.channel.sms.description',
  },
  title: {
    email: 'oie.enroll.okta_verify.enroll.channel.email.title',
    sms: 'oie.enroll.okta_verify.enroll.channel.sms.title',
  },
};

export const transformOktaVerifyEnrollChannel: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { authenticator } } = transaction;
  const { uischema } = formBag;
  const selectedChannel = authenticator?.contextualData?.selectedChannel;
  if (!selectedChannel) {
    return formBag;
  }

  const stepOneElements: UISchemaElement[] = [];
  stepOneElements.push({
    type: 'Title',
    options: {
      content: CHANNEL_TO_KEY_MAP.title[selectedChannel],
    },
  });

  REORDER_SCOPES.forEach((scope) => {
    const element = getUIElementWithScope(
      scope,
      formBag.uischema.elements as ControlElement[],
    );
    if (element) {
      stepOneElements.push(element);

      uischema.elements = removeUIElementWithScope(
        scope,
        formBag.uischema.elements as ControlElement[],
      );
    }
  });

  stepOneElements.push({
    type: 'Description',
    options: {
      content: CHANNEL_TO_KEY_MAP.description[selectedChannel],
    },
  } as DescriptionElement);

  stepOneElements.push({
    type: 'Control',
    label: 'oie.enroll.okta_verify.setupLink',
    scope: '#/properties/setupLink',
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
      idxMethod: 'proceed',
      idxStep: IDX_STEP.ENROLLMENT_CHANNEL_DATA,
    },
  } as ControlElement);

  const channelSelectionFormBag = transformOktaVerifyChannelSelection(transaction, formBag);
  merge(formBag.data, channelSelectionFormBag.data);
  merge(formBag.schema, channelSelectionFormBag.schema);

  const stepper: StepperLayout = {
    type: LayoutType.STEPPER,
    elements: [
      {
        type: LayoutType.VERTICAL,
        elements: stepOneElements,
      } as Layout,
      {
        type: LayoutType.VERTICAL,
        elements: [...channelSelectionFormBag.uischema.elements],
      } as Layout,
    ],
    options: {
      key: `${getCurrentTimestamp()}-${selectedChannel}`,
      navButtonsConfig: {
        next: {
          variant: 'clear',
          label: 'next.enroll.okta_verify.switch.channel.link.text',
        },
      } as Record<StepperNavButtonConfigDirection, StepperNavButtonConfigAttrs>,
    },
  };

  // prepend
  uischema.elements.unshift(stepper);

  return formBag;
};
