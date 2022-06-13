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

import {
  ControlProps,
} from '@jsonforms/core';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { RendererComponent, WrappedFunctionComponent } from 'src/types';

import { getDisplayName } from '../../util';

export const withFormValidationState: WrappedFunctionComponent<ControlProps> = (Component) => {
  const ParentComponent: RendererComponent<ControlProps> = (props: ControlProps) => {
    const [dirty, setDirty] = useState<boolean>(false);
    const [touched, setTouched] = useState<boolean>(false);
    const [untouched, setUntouched] = useState<boolean>(true);
    const [pristine, setPristine] = useState<boolean>(true);

    const combinedProps = {
      ...props,
      dirty,
      setDirty,
      touched,
      setTouched,
      untouched,
      setUntouched,
      pristine,
      setPristine,
    };
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component {...combinedProps} />;
  };
  ParentComponent.displayName = `WithFormValidationState(${getDisplayName(ParentComponent)})`;
  return ParentComponent;
};
