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

import { getStubFormBag } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  FormBag,
  LinkElement,
  StepperLayout,
  StepperRadioElement,
  TitleElement,
  UISchemaElement,
  UISchemaLayoutType,
} from 'src/types';

import { updateInteractiveElementsDescribedByValue } from './updateInteractiveElementsDescribedByValue';

describe('Update aria-describedby values for Interactive Elements Tests', () => {
  let formBag: FormBag;

  describe('Horizontal / Vertical Layout Schemas', () => {
    beforeEach(() => {
      formBag = getStubFormBag();
    });

    it('should add Title ID as aria-describedby values to field elements in non-Stepper flows', async () => {
      formBag.uischema.elements = [
        { type: 'Title', id: 'title_1', options: { content: 'Sign in' } } as TitleElement,
        { type: 'Field', id: 'identifier', options: { inputMeta: { name: 'identifier' } } } as FieldElement,
        { type: 'Field', id: 'credentials.passcode', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
        { type: 'Button', id: 'button_1', options: { type: ButtonType.SUBMIT } } as ButtonElement,
        { type: 'Link', id: 'link_1', options: { label: 'Forgot Password' } } as LinkElement,
      ];

      const updatedFormBag = updateInteractiveElementsDescribedByValue(formBag);

      expect(updatedFormBag).toMatchSnapshot();
      expect((updatedFormBag.uischema.elements[1] as UISchemaElement).ariaDescribedBy).toBe('title_1');
      expect((updatedFormBag.uischema.elements[2] as UISchemaElement).ariaDescribedBy).toBe('title_1');
      expect((updatedFormBag.uischema.elements[3] as UISchemaElement).ariaDescribedBy).toBe('title_1');
    });

    it('should add Title and Subtitle IDs as aria-describedby values to field elements in non-Stepper flows', () => {
      formBag.uischema.elements = [
        { type: 'Title', id: 'title_1', options: { content: 'Verify with your email' } } as TitleElement,
        {
          type: 'Description', id: 'subtitle_1', contentType: 'subtitle', options: { content: 'Please enter your code below' },
        } as DescriptionElement,
        { type: 'Field', id: 'credentials.passcode', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
        { type: 'Button', id: 'button_1', options: { type: ButtonType.SUBMIT } } as ButtonElement,
        { type: 'Link', id: 'link_1', options: { label: 'Back to sign in' } } as LinkElement,
      ];

      const updatedFormBag = updateInteractiveElementsDescribedByValue(formBag);

      expect(updatedFormBag).toMatchSnapshot();
      expect((updatedFormBag.uischema.elements[2] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_1');
      expect((updatedFormBag.uischema.elements[3] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_1');
    });

    it('should add Title and Subtitle IDs as aria-describedby values to field elements in non-Stepper flows containing additional informational text', () => {
      formBag.uischema.elements = [
        { type: 'Title', id: 'title_1', options: { content: 'Verify with your email' } } as TitleElement,
        {
          type: 'Description', id: 'subtitle_1', contentType: 'subtitle', options: { content: 'Please enter your code below' },
        } as DescriptionElement,
        { type: 'Field', id: 'credentials.passcode', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
        { type: 'Button', id: 'button_1', options: { type: ButtonType.SUBMIT } } as ButtonElement,
        { type: 'Link', id: 'link_1', options: { label: 'Back to sign in' } } as LinkElement,
        {
          type: UISchemaLayoutType.HORIZONTAL,
          elements: [
            { type: 'Description', id: 'descr_1', options: { content: 'Need an account?' } } as DescriptionElement,
            { type: 'Link', id: 'link_2', options: { label: 'Sign up' } } as LinkElement,
          ],
        },
      ];

      const updatedFormBag = updateInteractiveElementsDescribedByValue(formBag);

      expect(updatedFormBag).toMatchSnapshot();
      expect((updatedFormBag.uischema.elements[2] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_1');
      expect((updatedFormBag.uischema.elements[3] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_1');
    });
  });

  describe('Stepper Layout Schemas', () => {
    beforeEach(() => {
      formBag = getStubFormBag();
      formBag.uischema.elements = [
        { type: 'Title', id: 'title_1', options: { content: 'Verify with your email' } } as TitleElement,
      ];
    });

    it('should add Title ID as aria-describedby values to field elements in Stepper flows', () => {
      formBag.uischema.elements.push({
        type: UISchemaLayoutType.STEPPER,
        elements: [
          {
            type: UISchemaLayoutType.VERTICAL,
            elements: [
              {
                type: 'StepperRadio',
                id: 'radio_1',
                viewIndex: 0,
                options: {
                  name: 'fieldKey',
                  customOptions: [],
                  defaultValue: () => ({} as unknown),
                },
              } as StepperRadioElement,
              {
                type: 'Button', id: 'button_1', viewIndex: 0, options: { type: ButtonType.BUTTON },
              } as ButtonElement,
            ],
          },
          {
            type: UISchemaLayoutType.VERTICAL,
            elements: [
              {
                type: 'StepperRadio',
                id: 'radio_2',
                viewIndex: 1,
                options: {
                  name: 'fieldKey',
                  customOptions: [],
                  defaultValue: () => ({} as unknown),
                },
              } as StepperRadioElement,
              {
                type: 'Field', id: 'credentials.passcode_2', viewIndex: 1, options: { inputMeta: { name: 'credentials.passcode' } },
              } as FieldElement,
              {
                type: 'Button', id: 'button_2', viewIndex: 1, options: { type: ButtonType.BUTTON },
              } as ButtonElement,
            ],
          },
        ],
      } as StepperLayout);

      const updatedFormBag = updateInteractiveElementsDescribedByValue(formBag);

      expect(updatedFormBag).toMatchSnapshot();
      const stepper = updatedFormBag.uischema.elements[1] as StepperLayout;
      const viewOne = stepper.elements[0];
      const viewTwo = stepper.elements[1];
      expect((viewOne.elements[0] as UISchemaElement).ariaDescribedBy).toBe('title_1');
      expect((viewOne.elements[1] as UISchemaElement).ariaDescribedBy).toBe('title_1');
      expect((viewTwo.elements[0] as UISchemaElement).ariaDescribedBy).toBe('title_1');
      expect((viewTwo.elements[1] as UISchemaElement).ariaDescribedBy).toBe('title_1');
      expect((viewTwo.elements[2] as UISchemaElement).ariaDescribedBy).toBe('title_1');
    });

    it('should add Title and Subtitle IDs as aria-describedby values to field elements in Stepper flows', () => {
      formBag.uischema.elements.push({
        type: UISchemaLayoutType.STEPPER,
        elements: [
          {
            type: UISchemaLayoutType.VERTICAL,
            elements: [
              {
                type: 'Description', id: 'subtitle_1', viewIndex: 0, contentType: 'subtitle', options: { content: 'You will receieve a voice call' },
              } as DescriptionElement,
              {
                type: 'StepperRadio',
                id: 'radio_1',
                viewIndex: 0,
                options: {
                  name: 'fieldKey',
                  customOptions: [],
                  defaultValue: () => ({} as unknown),
                },
              } as StepperRadioElement,
              {
                type: 'Button', id: 'button_1', viewIndex: 0, options: { type: ButtonType.BUTTON },
              } as ButtonElement,
            ],
          },
          {
            type: UISchemaLayoutType.VERTICAL,
            elements: [
              {
                type: 'Description', id: 'subtitle_2', viewIndex: 1, contentType: 'subtitle', options: { content: 'You will receieve a text message' },
              } as DescriptionElement,
              {
                type: 'StepperRadio',
                id: 'radio_2',
                viewIndex: 1,
                options: {
                  name: 'fieldKey',
                  customOptions: [],
                  defaultValue: () => ({} as unknown),
                },
              } as StepperRadioElement,
              {
                type: 'Field', id: 'credentials.passcode_2', viewIndex: 1, options: { inputMeta: { name: 'credentials.passcode' } },
              } as FieldElement,
              {
                type: 'Button', id: 'button_2', viewIndex: 1, options: { type: ButtonType.BUTTON },
              } as ButtonElement,
            ],
          },
        ],
      } as StepperLayout);

      const updatedFormBag = updateInteractiveElementsDescribedByValue(formBag);

      expect(updatedFormBag).toMatchSnapshot();
      const stepper = updatedFormBag.uischema.elements[1] as StepperLayout;
      const viewOne = stepper.elements[0];
      const viewTwo = stepper.elements[1];
      expect((viewOne.elements[1] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_1');
      expect((viewOne.elements[2] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_1');
      expect((viewTwo.elements[1] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_2');
      expect((viewTwo.elements[2] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_2');
      expect((viewTwo.elements[3] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_2');
    });

    it('should add Title and Subtitle IDs as aria-describedby values to field elements in Stepper flows containing additional informational text', () => {
      formBag.uischema.elements.push({
        type: UISchemaLayoutType.STEPPER,
        elements: [
          {
            type: UISchemaLayoutType.VERTICAL,
            elements: [
              {
                type: 'Description', id: 'subtitle_1', viewIndex: 0, contentType: 'subtitle', options: { content: 'You will receieve a voice call' },
              } as DescriptionElement,
              {
                type: 'StepperRadio',
                id: 'radio_1',
                viewIndex: 0,
                options: {
                  name: 'fieldKey',
                  customOptions: [],
                  defaultValue: () => ({} as unknown),
                },
              } as StepperRadioElement,
              {
                type: 'Button', id: 'button_1', viewIndex: 0, options: { type: ButtonType.BUTTON },
              } as ButtonElement,
            ],
          },
          {
            type: UISchemaLayoutType.VERTICAL,
            elements: [
              {
                type: 'Description', id: 'subtitle_2', viewIndex: 1, contentType: 'subtitle', options: { content: 'You will receieve a text message' },
              } as DescriptionElement,
              {
                type: 'StepperRadio',
                id: 'radio_2',
                viewIndex: 1,
                options: {
                  name: 'fieldKey',
                  customOptions: [],
                  defaultValue: () => ({} as unknown),
                },
              } as StepperRadioElement,
              {
                type: 'Field', id: 'credentials.passcode_2', viewIndex: 1, options: { inputMeta: { name: 'credentials.passcode' } },
              } as FieldElement,
              {
                type: 'Button', id: 'button_2', viewIndex: 1, options: { type: ButtonType.BUTTON },
              } as ButtonElement,
              {
                type: UISchemaLayoutType.HORIZONTAL,
                elements: [
                  { type: 'Description', id: 'descr_1', options: { content: 'Need an account?' } } as DescriptionElement,
                  { type: 'Link', id: 'link_2', options: { label: 'Sign up' } } as LinkElement,
                ],
              },
            ],
          },
        ],
      } as StepperLayout);

      const updatedFormBag = updateInteractiveElementsDescribedByValue(formBag);

      expect(updatedFormBag).toMatchSnapshot();
      const stepper = updatedFormBag.uischema.elements[1] as StepperLayout;
      const viewOne = stepper.elements[0];
      const viewTwo = stepper.elements[1];
      expect((viewOne.elements[1] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_1');
      expect((viewOne.elements[2] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_1');
      expect((viewTwo.elements[1] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_2');
      expect((viewTwo.elements[2] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_2');
      expect((viewTwo.elements[3] as UISchemaElement).ariaDescribedBy).toBe('title_1 subtitle_2');
    });
  });
});
