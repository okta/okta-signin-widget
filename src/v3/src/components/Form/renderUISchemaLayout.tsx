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

import { useWidgetContext } from '../../contexts';
import {
  FieldElement,
  isUISchemaLayoutType,
  UISchemaElement,
  UISchemaElementComponent,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { isProductionEnvironment } from '../../util';
import renderers from './renderers';

export const renderUISchemaLayout: FunctionComponent<UISchemaLayout> = (uischema) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { stepperStepIndex } = useWidgetContext();
  const { type, elements } = uischema;

  if (type === UISchemaLayoutType.STEPPER) {
    return renderUISchemaLayout((elements as UISchemaLayout[])[stepperStepIndex]);
  }

  const flexDirection = type === UISchemaLayoutType.HORIZONTAL ? 'row' : 'column';
  return (
    <Box
      display="flex"
      flexDirection={flexDirection}
    >
      {
        elements.map((element, index) => {
          if (isUISchemaLayoutType(element.type)) {
            return renderUISchemaLayout(element as UISchemaLayout);
          }

          const renderer = renderers.find((r) => r.tester(element));

          if (!renderer) {
            // TODO: for now do not render for unmatch render object
            // remove unnecessary uischema in future refactor and throw error
            // throw new Error(`Failed to find render component for uischema: ${JSON.stringify(element)}`);
            if (!isProductionEnvironment()) {
              console.warn(`Failed to find render component for uischema: ${JSON.stringify(element)}`);
            }
            return null;
          }

          const elementKey = `${(element as FieldElement).name || element.type}_${index}`;
          const Component = renderer.renderer as UISchemaElementComponent;

          return (
            <Box
              marginBottom={4}
              key={elementKey}
            >
              <Component uischema={element as UISchemaElement} />
            </Box>
          );
        })
      }
    </Box>
  );
};
