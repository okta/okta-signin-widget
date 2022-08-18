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
  FieldElement,
  StepperLayout,
  UISchemaElement,
  UISchemaElementComponent,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { isDevelopmentEnvironment, isTestEnvironment } from '../../util';
import renderers from './renderers';
// eslint-disable-next-line import/no-cycle
import Stepper from './Stepper';

type LayoutProps = {
  uischema: UISchemaLayout;
  stepName?: string;
};

const Layout: FunctionComponent<LayoutProps> = ({ uischema, stepName }) => {
  const { type, elements } = uischema;

  const isHorizontalLayout = type === UISchemaLayoutType.HORIZONTAL;
  const flexDirection = isHorizontalLayout ? 'row' : 'column';
  let firstFieldFound = false;
  return (
    <Box
      display="flex"
      flexDirection={flexDirection}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(isHorizontalLayout && { gap: 1 })}
    >
      {
        elements.map((element, index) => {
          const elementKey = [element.type, stepName, index].join('_');

          if (element.type === UISchemaLayoutType.STEPPER) {
            return (
              <Stepper
                key={elementKey}
                uischema={element as StepperLayout}
              />
            );
          }

          if ([UISchemaLayoutType.HORIZONTAL, UISchemaLayoutType.VERTICAL]
            .includes((element as UISchemaLayout).type)) {
            return (
              <Layout
                key={elementKey}
                uischema={element as UISchemaLayout}
                stepName={stepName}
              />
            );
          }

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

          const uischemaElement = (element as UISchemaElement);
          const fieldElement = (uischemaElement as FieldElement);
          const isInputField = !Array.isArray(fieldElement.options?.inputMeta?.options) && !Array.isArray(fieldElement.options?.customOptions) && fieldElement.options?.inputMeta?.type !== 'boolean';

          if (element.type === 'Field' && isInputField && !firstFieldFound) {
            fieldElement.options = { ...fieldElement.options, focus: true };
            firstFieldFound = true;
          }

          const key = fieldElement.options?.inputMeta?.name && stepName
            ? `${fieldElement.options?.inputMeta?.name}_${stepName}`
            : elementKey;
          const Component = renderer.renderer as UISchemaElementComponent;
          return (
            <Box
              key={key}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(!(uischemaElement).noMargin && { marginBottom: 4 })}
            >
              <Component
                uischema={uischemaElement}
                tabIndex={index}
              />
            </Box>
          );
        })
      }
    </Box>
  );
};

export default Layout;
