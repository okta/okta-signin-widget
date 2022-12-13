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

import { Box } from '@mui/material';
import { FunctionComponent, h } from 'preact';

import {
  UISchemaElement,
  UISchemaElementComponent,
} from '../../types';
import { isDevelopmentEnvironment, isTestEnvironment } from '../../util';
import renderers from './renderers';

const ElementContainer: FunctionComponent<{ element: UISchemaElement }> = ({ element }) => {
  const renderer = renderers.find((r) => r.tester(element));
  if (!renderer) {
    // TODO: for now do not render for unmatch render object
    // remove unnecessary uischema in future refactor and throw error
    // throw new Error(`Failed to find render component for uischema: ${JSON.stringify(element)}`);
    if (isDevelopmentEnvironment() || isTestEnvironment()) {
      console.warn(`Failed to find render component for uischema: ${JSON.stringify(element)}`);
    }
    return null;
  }

  const Component = renderer.renderer as UISchemaElementComponent;
  return (
    <Box
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(!(element).noMargin && { marginBottom: 4 })}
    >
      <Component uischema={element} />
    </Box>
  );
};

export default ElementContainer;
