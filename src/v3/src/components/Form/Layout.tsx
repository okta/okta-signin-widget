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

  const isHorizontalLayout = type === UISchemaLayoutType.HORIZONTAL;
  const flexDirection = isHorizontalLayout ? 'row' : 'column';
  return (
    <Box
      display="flex"
      flexDirection={flexDirection}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...(isHorizontalLayout && { gap: 1 })}
    >
      {
        elements.map((element, index) => {
          const elementKey = getElementKey(element, index);

          if (element.type === UISchemaLayoutType.STEPPER) {
            return <Stepper uischema={element as StepperLayout} />;
          }

          if (element.type === UISchemaLayoutType.ACCORDION) {
            return <Accordion uischema={element as AccordionLayout} />;
          }

          if ([UISchemaLayoutType.HORIZONTAL, UISchemaLayoutType.VERTICAL]
            .includes((element as UISchemaLayout).type)) {
            return <Layout uischema={element as UISchemaLayout} />;
          }

          return (
            <ElementContainer
              key={elementKey}
              element={element as UISchemaElement}
            />
          );
        })
      }
    </Box>
  );
};

export default Layout;
