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

import { MDLImage, YubikeyDemoImage } from 'src/components/Images';
import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  LinkElement,
  TextWithActionLinkElement,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { loc } from '../../util';
import { getUIElementWithName } from '../utils';

const CHANNELS = ['phoneNumber', 'email'];
const CHANNEL_TO_KEY_MAP: {
  title: { [channel: string]: string },
  description: { [channel: string]: string },
} = {
  description: {
    email: 'oie.enroll.okta_verify.enroll.channel.email.subtitle',
    sms: 'oie.enroll.okta_verify.channel.sms.description.updated',
  },
  title: {
    email: 'oie.enroll.okta_verify.enroll.channel.email.title',
    sms: 'oie.enroll.okta_verify.enroll.channel.sms.title',
  },
};

export const transformMDLEnroll: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {

  const metaTag = document.createElement('meta');
  metaTag.httpEquiv = 'origin-trial';
  metaTag.content = 'Ai/6IZrwQetGr3t4gXaWD3u8Rt1zJl7lBuLjmf/bjotL6i+ngVkodPptJ8KbzoZxhyEWPh+ltVIgCg25EDDb/AcAAABreyJvcmlnaW4iOiJodHRwczovL2pheWhlLW9rdGEuZ2l0aHViLmlvOjQ0MyIsImZlYXR1cmUiOiJXZWJJZGVudGl0eURpZ2l0YWxDcmVkZW50aWFscyIsImV4cGlyeSI6MTc0NDc2MTU5OX0=';
  document.head.appendChild(metaTag);

  const { context, nextStep: { name } = {} } = transaction;
  // const authenticator = context.currentAuthenticator.value;
  const { uischema } = formBag;
  // const selectedChannel = authenticator.contextualData?.selectedChannel;
  // if (!selectedChannel) {
  //   return formBag;
  // }
  console.log("INSIDE TRANSFORMER")
  const elements: UISchemaElement[] = [];

  elements.push({
    type: 'Title',
    options: {
      content: 'Verify your mDL to continue',
    },
  } as TitleElement);

  CHANNELS.forEach((channelName) => {
    const element = getUIElementWithName(
      channelName,
      uischema.elements as UISchemaElement[],
    );
    if (element) {
      elements.push(element);
    }
  });

  // const imageElement: ImageWithTextElement = {
  //   type: 'ImageWithText',
  //   options: {
  //     id: 'mdl',
  //     SVGIcon: MDLImage,
  //     alignment: 'center',
  //   },
  // };

  // elements.push(imageElement)

  elements.push({
    type: 'Button',
    label: 'Continue',
    options: {
      type: ButtonType.BUTTON,
      step: name,
      onClick: async () => {
        const { data: mdlData } = await navigator?.credentials?.get({
          digital: {
              providers: [{
                  protocol: "preview",
                  request: {
            "selector": {
              "format": ["mdoc"],
              "doctype": "org.iso.18013.5.1.mDL",
              "fields": [
                {
                  "namespace": "org.iso.18013.5.1",
                  "name": "family_name",
                  "intentToRetain": false
                },
                {
                  "namespace": "org.iso.18013.5.1",
                  "name": "given_name",
                  "intentToRetain": false
                },
                {
                  "namespace": "org.iso.18013.5.1",
                  "name": "age_over_21",
                  "intentToRetain": false
                }
              ]
            },
            "nonce": "R3kjldEu4cWYiUcQeqqmZH502Vl9pob_v99jdNjuTJE=",
            "readerPublicKey": "BJulzAA82EZt372Z1LUnfBsKaMq0xlRGnFAmPUe0MQLmwyph_vbyPgpP8_QUuTTAO4H49T8HkzSrEdvMP1JpFV4="
          }
              }]
          }
        })
        console.log({mdlData})
      }
    },
  } as ButtonElement);


  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: 'cancel',
      dataSe: 'cancel',
    },
  };
  uischema.elements.push(cancelLink);


  uischema.elements = elements;

  return formBag;
};
