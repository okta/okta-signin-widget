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

import { IdxContext, IdxStatus } from '@okta/okta-auth-js';
import { WidgetProps } from '../../../types';

import { getStubFormBag, getStubTransaction } from '../../../mocks/utils/utils';
import { transformOdaEnrollment } from './transformOdaEnrollment';
import { transformOdaEnrollmentAndroidAppLink } from './transformOdaEnrollmentAndroidAppLink';
import { transformOdaEnrollmentLoopback } from './transformOdaEnrollmentLoopback';

jest.mock('./transformOdaEnrollmentAndroidAppLink', () => ({
  transformOdaEnrollmentAndroidAppLink: jest.fn(),
}));

jest.mock('./transformOdaEnrollmentLoopback', () => ({
  transformOdaEnrollmentLoopback: jest.fn(),
}));

describe('Terminal ODA enrollment transformer', () => {
  const transaction = getStubTransaction(IdxStatus.TERMINAL);
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction.messages = [];
    widgetProps = {};
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls android app link transformer when deviceEnrollment.isAndroidAppLink is true', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'oda',
          isAndroidAppLink: true,
        },
      },
    } as unknown as IdxContext;

    transformOdaEnrollment({ formBag, transaction, widgetProps });

    expect(transformOdaEnrollmentAndroidAppLink).toHaveBeenCalled();
  });

  it('calls loopback transformer when deviceEnrollment.isAndroidAppLink is false', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'oda',
          isAndroidAppLink: false,
        },
      },
    } as unknown as IdxContext;

    transformOdaEnrollment({ formBag, transaction, widgetProps });

    expect(transformOdaEnrollmentLoopback).toHaveBeenCalled();
  })
});
