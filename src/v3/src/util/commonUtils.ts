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

// eslint-disable-next-line
export const getDisplayName = (WrappedComponent: any): string => (
  WrappedComponent.displayName || WrappedComponent.name || 'Component'
);

export const handleFormFieldChange = (
  setDirtyFn: ((isDirty: boolean) => void) | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleChange: (path: string, value: any) => void,
  path: string,
  // eslint-disable-next-line
  value: any,
): void => {
  setDirtyFn?.(true);
  handleChange(path, value);
};
