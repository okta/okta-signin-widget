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
import { Accordion as OdyAccordion, useOdysseyDesignTokens } from '@okta/odyssey-react-mui';
import { FunctionComponent, h } from 'preact';

import { AccordionLayout } from '../../types';
import LayoutContainer from './LayoutContainer';

type AccordionProps = {
  uischema: AccordionLayout;
};

const Accordion: FunctionComponent<AccordionProps> = ({ uischema }) => {
  const { elements } = uischema;
  const tokens = useOdysseyDesignTokens();

  return (
    <Box>
      {
        elements.map((element) => (
          <Box
            key={element.key}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(!(element).noMargin && { marginBlockEnd: tokens.Spacing4 })}
          >
            <OdyAccordion
              hasShadow={false}
              label={element.options.summary}
              id={element.options.id}
            >
              <LayoutContainer
                uischema={element.options.content}
              />
            </OdyAccordion>
          </Box>
        ))
      }
    </Box>
  );
};

export default Accordion;
