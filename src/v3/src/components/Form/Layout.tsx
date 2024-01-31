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

import { LayoutContext } from '../../contexts';
import {
  AccordionLayout,
  StepperLayout,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { getElementKey } from '../../util';
import Accordion from './Accordion';
import ElementContainer from './ElementContainer';
import Stepper from './Stepper';

const Layout: FunctionComponent<{ uischema: UISchemaLayout }> = ({ uischema }) => {
  const { type, elements } = uischema;
  const layoutDirection = type === UISchemaLayoutType.HORIZONTAL
    ? UISchemaLayoutType.HORIZONTAL
    : UISchemaLayoutType.VERTICAL;

  return (
    <LayoutContext.Provider value={{ layoutDirection }}>
      <Box
        display="flex"
        flexDirection={layoutDirection === UISchemaLayoutType.HORIZONTAL ? 'row' : 'column'}
      >
        {
          elements.map((element, index) => {
            // for the layout element types attach the explicitly set key if
            // one was added to the uischema in the transformer
            if (element.type === UISchemaLayoutType.STEPPER) {
              return (
                <Stepper
                  key={(element as StepperLayout).key}
                  uischema={element as StepperLayout}
                />
              );
            }

            if (element.type === UISchemaLayoutType.ACCORDION) {
              return (
                <Accordion
                  key={(element as AccordionLayout).key}
                  uischema={element as AccordionLayout}
                />
              );
            }

            if ([UISchemaLayoutType.HORIZONTAL, UISchemaLayoutType.VERTICAL]
              .includes((element as UISchemaLayout).type)) {
              return (
                <Layout
                  key={(element as UISchemaLayout).key}
                  uischema={element as UISchemaLayout}
                />
              );
            }

            const elementKey = getElementKey(element, index);

            return (
              <ElementContainer
                key={elementKey}
                element={element as UISchemaElement}
              />
            );
          })
        }
      </Box>
    </LayoutContext.Provider>
  );
};

export default Layout;
