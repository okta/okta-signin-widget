/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

type AriaDescribedByKey = 'aria-describedby';

/**
 *
 * @description Accepts a string of current describedby IDs and an arbituary number of
 * additional IDs that needs to be concatenated to the final aria-describedby record.
 *
 */
export const useOnJoinAriaDescribedBy = (
  ...describedByIds: (string | undefined)[]
): Record<AriaDescribedByKey, string | undefined> => {
  const describedByValues = [...describedByIds.filter(Boolean)]
    .filter(Boolean).join(' ') || undefined;
  return { 'aria-describedby': describedByValues };
};
