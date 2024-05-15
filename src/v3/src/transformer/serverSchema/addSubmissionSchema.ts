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

import { flow } from 'lodash';

import {
  TransformStepFnWithOptions,
  UIEventType,
} from '../../types';

const addSubmission: TransformStepFnWithOptions = ({ transaction }) => (formbag) => {
  // @ts-ignore rootLayout does not exist in interface
  const { rootLayout: { events } = {} } = transaction?.rawIdxState;
  const { dataSchema } = formbag;

  const submissionEvent = events?.find((actionEvent: any) => actionEvent.type === UIEventType.ON_SUBMIT);
  if (submissionEvent) {
    dataSchema.submit = {
      actionParams: undefined,
      step: submissionEvent.action.step,
      includeData: submissionEvent.action.includeFormData,
      includeImmutableData: submissionEvent.action.includeImmutable,
    };
  } else {
    throw new Error('dataSchema default submit options should be set rootLayout of IDX response');
  }

  return formbag;
};

export const transformSubmissionSchema: TransformStepFnWithOptions = (
  options,
) => (formbag) => flow(
  addSubmission(options),
)(formbag);
